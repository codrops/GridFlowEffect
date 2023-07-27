export class Loader {
	// Define object to hold relevant DOM elements for the Loader
	DOM = {
		// Main DOM element for the loader
		el: null,
		// Progress element .loader__progress
		progressElement: null,
		// The DOM element to show loading progress
		progressValueElement: null,
		// Images container .loader__img
		imagesContainer: null,
		// The gallery items that will appear next to the loader
		galleryItems: null,
	};

	/**
	 * Constructor function of the Loader class
	 * @param {HTMLElement} DOM_el - The main DOM element for the loader.
	 * @param {NodeList} GalleryItems - The gallery items that will appear next to the loader.
	 */
	constructor(DOM_el, galleryItems) {
		// Store the main DOM element
		this.DOM.el = DOM_el;
		// progress element
		this.DOM.progressElement = this.DOM.el.querySelector('.loader__progress');
		// progress value
		this.DOM.progressValueElement = this.DOM.el.querySelector('.loader__progress-text');
		// images
		this.DOM.imagesContainer = this.DOM.el.querySelector('.loader__img');
		this.DOM.galleryItems = galleryItems;
		this.DOM.imagesContainer.append(...this.DOM.galleryItems);
	}

	/**
	 * Function to load all assets and update the loading progress.
	 * @param {string} assetsSelector - The selector string to find all assets to load.
	 * @returns {Promise} - A promise that resolves when all assets are loaded, or rejects if any asset fails to load.
	 */
	loadAssets(assetsSelector) {
		return new Promise((resolve, reject) => {
			// Start loading all assets found by the assetsSelector
			// Use the option {background: true} to detect loading of background images as well
			const imgLoad = imagesLoaded(document.querySelectorAll(assetsSelector), {background: true});

			let allImagesLoaded = false;
			let allImagesAnimationComplete = false;
			let progress = 0;
			// The rate at which we increment progress (100 increments in 2 seconds = 0.05 increments per millisecond)
			const incrementRate = 100 / 500;
			// Start a setInterval to increment progress at the specified rate
			const intervalId = setInterval(() => {
				if (progress < 100) {
					// Increment progress
					progress += incrementRate;
					// Update progress in the DOM
					this.DOM.progressValueElement.innerText = Math.round(progress);
				} else {
					// Check if all images have loaded, and if so, resolve the promise
					if (allImagesLoaded && allImagesAnimationComplete) {
						// Clear the interval
						clearInterval(intervalId);
						
						gsap.to(this.DOM.progressElement, {
							duration: 0.5,
							opacity: 0
						});
						resolve();
					}
				}
			}, 1); // Run the interval every millisecond for a smoother progress update

			// Create a GSAP timeline
			// Scale up galleryItems during the loading process
			gsap
			.timeline()
			.fromTo(this.DOM.galleryItems, {
				scale: 0,
				opacity: 0
			}, {
				duration: .4,
				scale: 1,
				opacity: 1,
				stagger: 2 / this.DOM.galleryItems.length,
				ease: 'power4',
				onComplete: () => allImagesAnimationComplete = true
			});

			// Attach an always event listener to imgLoad, which fires when all images are loaded
			imgLoad.on('always', instance => {
				console.log('all images loaded');
				allImagesLoaded = true;
			});

			// Attach a fail event listener to imgLoad, which fires when any image fails to load
			imgLoad.on('fail', instance => {
				console.log('some images failed');
				reject();
			});
		});
	}
}