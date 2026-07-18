#!/usr/bin/env python3
"""
acs_scoring_function.py
Fungsi ACS scoring untuk integrasi ke dashboard speedometer Anggota A.
E-Jatim TrustLink | EJAVEC 2026

Cara pakai:
    import joblib, json
    from acs_scoring_function import compute_acs_score

    model  = joblib.load('best_model.pkl')
    scaler = joblib.load('scaler.pkl')
    with open('feature_names.json') as f:
        feature_names = json.load(f)

    result = compute_acs_score(
        row=row_series, model=model, scaler=scaler,
        feature_names=feature_names, reputation_score=50.0
    )
    # result['acs_score']  -> 0-100 untuk speedometer
    # result['kategori']   -> 'Hijau' / 'Kuning' / 'Merah'
    # result['breakdown']  -> breakdown per komponen
"""

import numpy as np
import pandas as pd


def compute_acs_score(
    row,
    model,
    scaler,
    feature_names: list,
    reputation_score: float = 50.0,
    weights: dict = None,
) -> dict:
    """
    Hitung ACS Score untuk satu baris data UMKM.

    Parameters
    ----------
    row : pd.Series
        Satu baris data yang sudah di-preprocess dan feature engineering
    model : fitted estimator
        best_model.pkl
    scaler : fitted StandardScaler
        scaler.pkl
    feature_names : list
        feature_names.json
    reputation_score : float
        0-100, dari pipeline NLP Minggu 3. Default=50.0 (placeholder).
    weights : dict
        Bobot komponen ACS. Default = tentatif.

    Returns
    -------
    dict dengan acs_score, kategori, label, breakdown, weights, note
    """
    if weights is None:
        weights = {'w1': 0.25, 'w2': 0.25, 'w3': 0.20, 'w4': 0.30}

    row_model  = np.array([row.get(f, 0) for f in feature_names]).reshape(1, -1)
    row_scaled = scaler.transform(row_model)

    prob_repay     = model.predict_proba(row_scaled)[0][0]
    risk_score     = prob_repay * 100

    ext_mean       = float(row.get('EXT_SOURCE_MEAN', 0.5))
    income         = float(row.get('AMT_INCOME_TOTAL', 150000))
    income_norm    = min(income / 500_000, 1.0)
    growth_score   = max(0.0, min((ext_mean * 0.8 + income_norm * 0.2) * 100, 100.0))

    employ_yrs     = float(row.get('EMPLOYMENT_YEARS', 0))
    has_car        = float(row.get('FLAG_OWN_CAR', 0))
    has_realty     = float(row.get('FLAG_OWN_REALTY', 0))
    annuity_ratio  = float(row.get('ANNUITY_INCOME_RATIO', 0.3))
    stability_score = max(0.0, min(
        min(employ_yrs / 20, 1.0) * 40 + has_car * 15 + has_realty * 20
        + max(0.0, (1 - annuity_ratio * 2)) * 25, 100.0
    ))

    rep_score = float(reputation_score)

    acs_raw   = (
        weights['w1'] * growth_score + weights['w2'] * stability_score
        + weights['w3'] * rep_score - weights['w4'] * (100 - risk_score)
    )
    acs_score = max(0.0, min(acs_raw, 100.0))

    if acs_score >= 70:
        kategori, label = 'Hijau', 'Layak Kredit'
    elif acs_score >= 40:
        kategori, label = 'Kuning', 'Perlu Kajian Lebih Lanjut'
    else:
        kategori, label = 'Merah', 'Risiko Tinggi'

    return {
        'acs_score' : round(acs_score, 2),
        'kategori'  : kategori,
        'label'     : label,
        'breakdown' : {
            'growth_score'    : round(growth_score, 2),
            'stability_score' : round(stability_score, 2),
            'reputation_score': round(rep_score, 2),
            'risk_score'      : round(risk_score, 2),
        },
        'weights'   : weights,
        'note'      : (
            'BOBOT TENTATIF. w3 = PLACEHOLDER 50.0 — '
            'ganti dengan output NLP Minggu 3.'
        ),
    }
