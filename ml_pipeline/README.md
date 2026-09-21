# SANKALP Machine Learning / NLP Subsystem

**Academic Year:** 2026–2027  
**Degree:** B.Tech Computer Science & Engineering Major Project  
**Module:** Natural Language Processing & Automated Triage Engine

---

## 1. Mathematical Architecture

The NLP pipeline classifies citizen emergency text into 8 categories and assesses priority:

```
Text Input
   │
   ▼
Text Preprocessing (Lowercasing, Punctuation removal, English Stopwords removal)
   │
   ▼
N-Gram Generation (Unigrams + Bigrams, e.g., "road accident", "cylinder blast")
   │
   ▼
TF-IDF Vectorization:
  - Sublinear TF: tf(t, d) = 1 + log(count(t, d))
  - Smooth IDF: idf(t) = log((1 + N) / (1 + df(t))) + 1
  - L2 Normalization
   │
   ▼
Multinomial Naive Bayes Classifier (Laplace Smoothing α = 1.0):
  P(C_k | d) ∝ P(C_k) * ∏ P(t_i | C_k)^(tf(t_i, d))
   │
   ▼
Category Probabilities (Softmax normalized) + Criticality Heuristic -> Priority (HIGH, CRITICAL, MEDIUM, LOW)
```

---

## 2. Running Locally in VS Code (Windows/Linux/Mac)

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Train the Model:**
   ```bash
   python train_model.py
   ```
   *Expected Output: >95% accuracy on test split, saves `sankalp_nlp_model.joblib` and `model_metadata.json`.*

3. **Run a Test Prediction:**
   ```bash
   python predict.py "Two people are injured in a road accident. One person appears unconscious and immediate help is required."
   ```
   *Output: Category `Road Accident`, Confidence >95%.*
