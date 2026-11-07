#!/usr/bin/env python3
"""Build launcher and splash images from the owner's OJ monogram."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "icon-source.png"
BG = (255, 255, 255, 255)
SPLASH_BG = (244, 244, 246, 255)


def content_box(image):
    pixels = image.load()
    width, height = image.size
    min_x, min_y, max_x, max_y = width, height, 0, 0
    for y in range(height):
        for x in range(width):
            red, green, blue, alpha = pixels[x, y]
            if alpha > 20 and not (red > 245 and green > 245 and blue > 245):
                min_x, min_y = min(min_x, x), min(min_y, y)
                max_x, max_y = max(max_x, x), max(max_y, y)
    return min_x, min_y, max_x + 1, max_y + 1


def punch_white(image):
    image = image.convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            red, green, blue, alpha = pixels[x, y]
            if alpha > 0 and red > 245 and green > 245 and blue > 245:
                pixels[x, y] = (red, green, blue, 0)
    return image


def contain(image, size, fill):
    canvas = Image.new("RGBA", (size, size), fill)
    scale = min(size / image.width, size / image.height)
    resized = image.resize((max(1, round(image.width * scale)), max(1, round(image.height * scale))), Image.Resampling.LANCZOS)
    canvas.alpha_composite(resized, ((size - resized.width) // 2, (size - resized.height) // 2))
    return canvas


def adaptive_foreground(source):
    # The monogram is wider than Android's circular safe zone, so the same
    # artwork is scaled down on a white field. The mark itself is unchanged.
    left, top, right, bottom = content_box(source)
    mark = source.crop((left, top, right, bottom))
    canvas = Image.new("RGBA", source.size, BG)
    target = int(source.width * 0.62)
    scale = target / max(mark.width, mark.height)
    resized = mark.resize((max(1, round(mark.width * scale)), max(1, round(mark.height * scale))), Image.Resampling.LANCZOS)
    canvas.alpha_composite(resized, ((source.width - resized.width) // 2, (source.height - resized.height) // 2))
    return canvas


def save_png(image, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    image.convert("RGBA").save(path, "PNG")


def main():
    source = Image.open(SOURCE).convert("RGBA")
    foreground = adaptive_foreground(source)
    android = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }
    adaptive = {
        "mipmap-mdpi": 108,
        "mipmap-hdpi": 162,
        "mipmap-xhdpi": 216,
        "mipmap-xxhdpi": 324,
        "mipmap-xxxhdpi": 432,
    }
    res = ROOT / "android" / "app" / "src" / "main" / "res"
    for folder, size in android.items():
        icon = contain(source, size, BG)
        save_png(icon, res / folder / "ic_launcher.png")
        save_png(icon, res / folder / "ic_launcher_round.png")
    for folder, size in adaptive.items():
        save_png(contain(foreground, size, BG), res / folder / "ic_launcher_foreground.png")
    splash_sizes = {
        "drawable": (480, 800),
        "drawable-port-mdpi": (320, 480),
        "drawable-port-hdpi": (480, 800),
        "drawable-port-xhdpi": (720, 1280),
        "drawable-port-xxhdpi": (960, 1600),
        "drawable-port-xxxhdpi": (1280, 1920),
        "drawable-land-mdpi": (480, 320),
        "drawable-land-hdpi": (800, 480),
        "drawable-land-xhdpi": (1280, 720),
        "drawable-land-xxhdpi": (1600, 960),
        "drawable-land-xxxhdpi": (1920, 1280),
    }
    mark = punch_white(source.crop(content_box(source)))
    for folder, (width, height) in splash_sizes.items():
        canvas = Image.new("RGBA", (width, height), SPLASH_BG)
        logo = contain(mark, int(min(width, height) * 0.46), (0, 0, 0, 0))
        canvas.alpha_composite(logo, ((width - logo.width) // 2, (height - logo.height) // 2))
        save_png(canvas, res / folder / "splash.png")
    ios = ROOT / "ios" / "App" / "App" / "Assets.xcassets" / "AppIcon.appiconset"
    save_png(contain(source, 1024, BG), ios / "AppIcon-512@2x.png")
    splash_ios = ROOT / "ios" / "App" / "App" / "Assets.xcassets" / "Splash.imageset"
    mark = punch_white(source.crop(content_box(source)))
    for name in ("splash-2732x2732.png", "splash-2732x2732-1.png", "splash-2732x2732-2.png"):
        canvas = Image.new("RGBA", (2732, 2732), SPLASH_BG)
        logo = contain(mark, int(2732 * 0.28), (0, 0, 0, 0))
        canvas.alpha_composite(logo, ((2732 - logo.width) // 2, (2732 - logo.height) // 2))
        save_png(canvas, splash_ios / name)
    print("icons written")


if __name__ == "__main__":
    main()
