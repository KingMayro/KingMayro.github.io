import os
import sys
from PIL import Image, ImageSequence
import argparse

def hex_to_rgb(hex_color):
    """Convert hex color string to RGB tuple."""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def replace_color(img, target_color, replacement_color):
    """Replace all pixels of target_color with replacement_color in an image."""
    target_color = hex_to_rgb(target_color.lower())
    replacement_color = hex_to_rgb(replacement_color.lower())

    # Convert the image to RGBA (to handle transparency)
    img = img.convert('RGBA')
    data = img.getdata()

    new_data = []
    for pixel in data:
        # If pixel matches target color, replace it
        if pixel[:3] == target_color:  # Ignore the alpha channel in the comparison
            new_data.append(replacement_color + (pixel[3],))  # Keep original alpha
        else:
            new_data.append(pixel)
    
    img.putdata(new_data)
    return img

def process_png(filepath, base_color, accent_color, highlight_color):
    """Process and replace colors in a PNG image."""
    print(f"Processing PNG: {filepath}...")

    # Open the image
    img = Image.open(filepath)

    # Replace base, accent, and highlight colors
    img = replace_color(img, '#cd532d', base_color)  # Base color replacement
    img = replace_color(img, '#a33817', accent_color)  # Accent color replacement
    img = replace_color(img, '#f07751', highlight_color)  # Highlight color replacement

    # Save the modified image (overwrite the original file)
    img.save(filepath)
    print(f"Updated PNG: {filepath}.")

def process_gif(filepath, base_color, accent_color, highlight_color):
    """Process and replace colors in all frames of a GIF image."""
    print(f"Processing GIF: {filepath}...")

    # Open the GIF image
    img = Image.open(filepath)
    
    frames = []
    for frame in ImageSequence.Iterator(img):
        # Replace base, accent, and highlight colors in each frame
        new_frame = replace_color(frame.copy(), '#cd532d', base_color)
        new_frame = replace_color(new_frame, '#a33817', accent_color)
        new_frame = replace_color(new_frame, '#f07751', highlight_color)
        frames.append(new_frame)

    # Save the modified frames as a GIF (preserving the original GIF's duration and loop settings)
    frames[0].save(filepath, save_all=True, append_images=frames[1:], loop=img.info.get('loop', 0), duration=img.info.get('duration', 100), disposal=2)
    print(f"Updated GIF: {filepath}.")

def process_images_in_directory(base_color, accent_color, highlight_color):
    """Process all PNG and GIF images in the current working directory and replace base, accent, and highlight colors."""
    current_directory = os.getcwd()

    for filename in os.listdir(current_directory):
        filepath = os.path.join(current_directory, filename)

        if filename.lower().endswith(".png"):
            process_png(filepath, base_color, accent_color, highlight_color)
        elif filename.lower().endswith(".gif"):
            process_gif(filepath, base_color, accent_color, highlight_color)

def main():
    # Set up command-line argument parsing
    parser = argparse.ArgumentParser(description="Replace base, accent, and highlight colors in PNG and GIF files in the current directory.")
    parser.add_argument('-b', '--base', required=True, help="Replacement color for base (#cd532d).")
    parser.add_argument('-a', '--accent', required=True, help="Replacement color for accent (#a33817).")
    parser.add_argument('-H', '--highlight', required=True, help="Replacement color for highlight (#f07751).")

    args = parser.parse_args()

    base_color = args.base.lstrip('#')
    accent_color = args.accent.lstrip('#')
    highlight_color = args.highlight.lstrip('#')

    # Process the images in the current directory
    process_images_in_directory(base_color, accent_color, highlight_color)

if __name__ == "__main__":
    main()
