// Preload images
const preloadImages = (items) => {
    return new Promise((resolve) => {
        imagesLoaded(items, {background: true}, resolve);
    });
};

export {
    preloadImages,
};