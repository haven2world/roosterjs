import getGeneratedImageSize from './generateImageSize';
import { ImageMetadataFormat } from 'roosterjs-content-model-types/lib';

/**
 * @internal
 * Generate new dataURL from an image and edit info
 * @param image The image to generate data URL from. It is supposed to have original src loaded
 * @param editInfo Edit info of the image
 * @returns A BASE64 encoded string with image prefix that represents the content of the generated image.
 * If there are rotate/crop/resize info in the edit info, the generated image will also reflect the result.
 * It is possible to throw exception since the original image may not be able to read its content from
 * the code, so better check canRegenerateImage() of the image first.
 * @throws Exception when fail to generate dataURL from canvas
 */
export default function generateDataURL(
    image: HTMLImageElement,
    editInfo: ImageMetadataFormat
): string | undefined {
    const generatedImageSize = getGeneratedImageSize(editInfo);
    if (!generatedImageSize) {
        return;
    }
    const {
        angleRad,
        widthPx,
        heightPx,
        bottomPercent,
        leftPercent,
        rightPercent,
        topPercent,
        naturalWidth,
        naturalHeight,
    } = editInfo;
    const angle = angleRad || 0;
    const left = leftPercent || 0;
    const right = rightPercent || 0;
    const top = topPercent || 0;
    const bottom = bottomPercent || 0;
    const height = naturalHeight || 0;
    const width = naturalWidth || 0;

    const imageWidth = width * (1 - left - right);
    const imageHeight = height * (1 - top - bottom);

    // Adjust the canvas size and scaling for high display resolution
    const devicePixelRatio = window.devicePixelRatio || 1;
    const canvas = document.createElement('canvas');
    const { targetWidth, targetHeight } = generatedImageSize;
    canvas.width = targetWidth * devicePixelRatio;
    canvas.height = targetHeight * devicePixelRatio;

    const context = canvas.getContext('2d');
    if (context && widthPx && heightPx) {
        context.scale(devicePixelRatio, devicePixelRatio);
        context.translate(targetWidth / 2, targetHeight / 2);
        context.rotate(angle);
        context.scale(editInfo.flippedHorizontal ? -1 : 1, editInfo.flippedVertical ? -1 : 1);
        context.drawImage(
            image,
            width * left,
            height * top,
            imageWidth,
            imageHeight,
            -widthPx / 2,
            -heightPx / 2,
            widthPx,
            heightPx
        );
    }

    return canvas.toDataURL('image/png', 1.0);
}
