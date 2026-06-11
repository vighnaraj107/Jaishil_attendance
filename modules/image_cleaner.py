import cv2
import os


def clean_image(image_path, output_folder):

    os.makedirs(output_folder, exist_ok=True)

    image = cv2.imread(image_path)

    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # CLAHE — boosts local contrast without blowing out handwriting strokes.
    # Much better than adaptive threshold for messy/handwritten text.
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)

    # Light denoising — strength 10 (was 30) so thin strokes aren't smeared.
    denoised = cv2.fastNlMeansDenoising(enhanced, None, 10, 7, 21)

    # Gentle unsharp mask to sharpen edges without over-sharpening.
    blur = cv2.GaussianBlur(denoised, (0, 0), 2)
    sharpened = cv2.addWeighted(denoised, 1.3, blur, -0.3, 0)

    # Save as grayscale (NOT binary) — Claude reads tonal gradient too,
    # which helps with unclear or overlapping handwritten characters.
    filename = os.path.basename(image_path)
    save_path = os.path.join(output_folder, filename)
    cv2.imwrite(save_path, sharpened)

    print(f"Cleaned Image Saved: {save_path}")
    return save_path
