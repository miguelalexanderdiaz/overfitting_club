# Multivariate Regression: Sunspot Prediction

This project demonstrates multivariate regression using TensorFlow to predict sunspot activity. It's designed as a self-contained uv project for reproducible analysis.

## Features

- **Time Series Analysis**: Comprehensive exploration of sunspot data with ACF/PACF plots
- **Feature Engineering**: Moving averages and seasonal features
- **Deep Learning**: LSTM model for time series prediction
- **Uncertainty Quantification**: Confidence intervals for predictions
- **Reproducible Environment**: All dependencies managed with uv

## Quick Start

From the quarto_blog root directory:

```bash
# Test the environment
uv run --project blog/posts/multivariate_regression python -c "import tensorflow as tf; print('Environment ready!')"

# Run the analysis
uv run --project blog/posts/multivariate_regression jupyter notebook multivariate_regression_tf.qmd
```

## Dependencies

All dependencies are defined in `pyproject.toml`:
- TensorFlow 2.20.0+
- Kagglehub for dataset download
- Pandas, NumPy for data manipulation
- Matplotlib, Seaborn for visualization
- Scikit-learn for preprocessing
- Statsmodels for time series analysis

## Project Structure

```
multivariate_regression/
├── multivariate_regression_tf.qmd  # Main analysis notebook
├── pyproject.toml                  # Project dependencies
├── README.md                       # This file
└── data/                          # Data directory (created by kagglehub)
    └── robervalt/
        └── sunspots/
            └── Sunspots.csv       # Downloaded dataset
```

## Results

The model achieves a validation MAE of approximately 13.17 sunspots on the original scale, demonstrating effective prediction of solar activity patterns with uncertainty quantification.
