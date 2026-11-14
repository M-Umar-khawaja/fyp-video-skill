# DermaScan: on-device skin lesion triage
BS Computer Science FYP, FAST-NUCES Lahore. Team: Zain Ali, Mehak Fatima. Supervisor: Dr. Omar Farooq.

- Dataset: HAM10000 (10,015 dermoscopic images, 7 classes), 80/10/10 split, test set held out.
- Model: EfficientNet-B0 fine-tuned, quantised to INT8 with TensorFlow Lite for Android.
- Measured on the held-out test set: balanced accuracy 81.4 %, melanoma recall 88.2 %. Baseline (ResNet-50, same split): balanced accuracy 76.9 %.
- Measured on a Pixel 7: 38 ms per image inference.
- Target for next phase: run on low-end phones (2 GB RAM) under 150 ms; clinical pilot with Mayo Hospital dermatology (planned, ethics approval pending).
- App: capture photo -> on-device model -> risk level (low / see a doctor / urgent) -> nearest dermatologist list.
