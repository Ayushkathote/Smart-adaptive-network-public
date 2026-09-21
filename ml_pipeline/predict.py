#!/usr/bin/env python3
"""
SANKALP Emergency Classifier - CLI Prediction Tool
Usage: python predict.py "Your emergency description"
"""

import os
import sys
import joblib

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, "sankalp_nlp_model.joblib")

    if not os.path.exists(model_path):
        print("Model file not found. Please train first by running: python train_model.py")
        sys.exit(1)

    if len(sys.argv) < 2:
        text = "Two people are injured in a road accident. One person appears unconscious and immediate help is required."
        print(f"No text provided. Running default demonstration test:\n'{text}'\n")
    else:
        text = " ".join(sys.argv[1:])

    pipeline = joblib.load(model_path)
    pred_cat = pipeline.predict([text])[0]
    pred_proba = pipeline.predict_proba([text])[0]
    clf = pipeline.named_steps['clf']

    print("=" * 60)
    print("SANKALP AI NLP Prediction Result")
    print("=" * 60)
    print(f"Input Text: \"{text}\"")
    print(f"Predicted Category: {pred_cat}")
    print("\nClass Probabilities:")
    for cls_name, prob in sorted(zip(clf.classes_, pred_proba), key=lambda x: x[1], reverse=True):
        print(f"  - {cls_name.ljust(20)}: {prob * 100:.2f}%")
    print("=" * 60)

if __name__ == "__main__":
    main()
