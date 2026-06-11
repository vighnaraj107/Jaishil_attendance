import os
from pdf2image import convert_from_path


def convert_pdf_to_images(pdf_path, output_folder):

    os.makedirs(output_folder, exist_ok=True)

    # Higher DPI = better detail for handwriting
    pages = convert_from_path(
        pdf_path,
        dpi=400,
        poppler_path=r"C:\poppler-26.02.0\Library\bin"   # WINDOWS ONLY
    )

    image_paths = []

    for i, page in enumerate(pages):

        image_name = f"page_{i+1}.jpg"
        image_path = os.path.join(output_folder, image_name)

        # Higher quality JPEG = less compression artefacts
        page.save(image_path, "JPEG", quality=95)

        image_paths.append(image_path)
        print(f"Saved: {image_path}")

    return image_paths
