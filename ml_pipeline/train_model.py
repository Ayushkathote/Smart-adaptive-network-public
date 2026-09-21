#!/usr/bin/env python3
"""
SANKALP: AI-Based Smart Adaptive Network for Community Assistance & Public Safety
B.Tech CSE Major Project 2026-2027

ML Training Pipeline:
Text -> Preprocessing -> TF-IDF Vectorizer (Unigram + Bigram) -> Multinomial Naive Bayes Classifier
"""

import os
import sys
import json
import pandas as pd
import numpy as np

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.naive_bayes import MultinomialNB
    from sklearn.pipeline import Pipeline
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
    import joblib
except ImportError:
    print("=================================================================")
    print("ERROR: scikit-learn or dependencies not installed.")
    print("Run: pip install scikit-learn numpy pandas joblib")
    print("=================================================================")
    sys.exit(1)

def train_sankalp_nlp_model():
    print("=" * 65)
    print("  SANKALP ML Engine - Training Emergency NLP Classifier")
    print("  Model: TF-IDF Vectorizer + Multinomial Naive Bayes (Laplace alpha=1.0)")
    print("=" * 65)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(base_dir, "dataset.csv")

    if not os.path.exists(dataset_path):
        print(f"Error: Dataset not found at {dataset_path}")
        return

    # Load dataset
    df = pd.read_csv(dataset_path)
    print(f"Loaded {len(df)} emergency reports across {df['category'].nunique()} categories:")
    for cat, count in df['category'].value_counts().items():
        print(f"  - {cat.ljust(20)}: {count} samples")

    X = df['text']
    y = df['category']

    # Stratified Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("\nTraining set:", len(X_train), "samples | Test set:", len(X_test), "samples")

    # Scikit-learn Pipeline with TF-IDF Vectorizer & MultinomialNB
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            ngram_range=(1, 2),
            stop_words='english',
            sublinear_tf=True,
            smooth_idf=True,
            min_df=1
        )),
        ('clf', MultinomialNB(alpha=1.0))
    ])

    print("\nFitting model on training set...")
    pipeline.fit(X_train, y_train)

    # Evaluate
    y_pred = pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n[OK] Model Test Accuracy: {accuracy * 100:.2f}%")
    print("\nDetailed Classification Report:")
    print(classification_report(y_test, y_pred, zero_division=0))

    # Save joblib artifact
    model_output_path = os.path.join(base_dir, "sankalp_nlp_model.joblib")
    joblib.dump(pipeline, model_output_path)
    print(f"[OK] Trained model artifact saved to: {model_output_path}")

    # Export Vocabulary & Weights for Node.js / Web consumption
    vectorizer = pipeline.named_steps['tfidf']
    clf = pipeline.named_steps['clf']
    export_meta = {
        "model_name": "SANKALP_TFIDF_MultinomialNB",
        "academic_year": "2026-2027",
        "vocabulary_size": len(vectorizer.vocabulary_),
        "classes": clf.classes_.tolist(),
        "test_accuracy": f"{accuracy * 100:.2f}%",
        "sample_test_predictions": [
            {
                "input": "Two people are injured in a road accident. One person appears unconscious and immediate help is required.",
                "predicted_category": str(pipeline.predict(["Two people are injured in a road accident. One person appears unconscious and immediate help is required."])[0]),
                "predicted_proba": {cls: float(p) for cls, p in zip(clf.classes_, pipeline.predict_proba(["Two people are injured in a road accident. One person appears unconscious and immediate help is required."])[0])}
            }
        ]
    }

    meta_path = os.path.join(base_dir, "model_metadata.json")
    with open(meta_path, "w") as f:
        json.dump(export_meta, f, indent=2)
    print(f"[OK] Model metadata exported to: {meta_path}")

    # Demonstration of the exact user prompt scenario
    demo_input = "Two people are injured in a road accident. One person appears unconscious and immediate help is required."
    pred_cat = pipeline.predict([demo_input])[0]
    pred_proba = pipeline.predict_proba([demo_input])[0]
    best_idx = np.argmax(pred_proba)
    confidence = pred_proba[best_idx] * 100

    print("\n" + "=" * 65)
    print("  VERIFICATION ON COLLEGE DEMO SCENARIO:")
    print(f"  Input: \"{demo_input}\"")
    print(f"  -> Predicted Category: {pred_cat}")
    print(f"  -> Model Confidence:   {confidence:.2f}%")
    print("=" * 65)

if __name__ == "__main__":
    train_sankalp_nlp_model()
