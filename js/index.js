// Import necessary functions and classes
import { preloadImages } from './utils.js';
import { Loader } from './loader.js';
import { Gallery } from './gallery.js';
import { Navigation } from './navigation.js';

// Get window size
const winsize = {width: window.innerWidth, height: window.window.innerHeight};

// Initialize DOM elements
const DOM = {};
DOM.loader = document.querySelector('.loader');
DOM.galleries = document.querySelectorAll('.gallery');
DOM.nav = document.querySelector('.nav');
DOM.frame = document.querySelector('.frame');

// Current gallery index
let current = 0;

// Array to hold Gallery instances
const galleriesArr = [];
// Instantiate Gallery class for each gallery and add to array
[...DOM.galleries].forEach(gallery => {
	galleriesArr.push(new Gallery(gallery));
});
// Total number of galleries
const totalGalleries = galleriesArr.length;

// Initialize Loader with next gallery items (as they will animate during loading)
const loader = new Loader(DOM.loader, galleriesArr[current+1].DOM.items);

// Initialize Navigation
const navigation = new Navigation(DOM.nav);

// Animation settings
const animationSettings = {
	duration: 1.7,
	itemDelay: 0.08
};

let isAnimating = false;

// Function to create the initial animation and display current gallery with next/previous controls
const setupGalleryAnimation = () => {
	isAnimating = true;

	// Create parent timeline for controlling the animations
	const parentTimeline = gsap.timeline({
		onComplete: () => isAnimating = false
	});

	// Loop through each gallery item in the loader
	loader.DOM.galleryItems.forEach((galleryItem, pos) => {
		// Image child element
		const inner = galleryItem.querySelector('.gallery__item-inner');
		// Get necessary scale factor (image gets fullscreen but we'll actually use scaleFactor/2)
		const scaleFactor = winsize.height / galleryItem.offsetHeight;
		// Save the state of the galleryItem at this point
		const flipstate = Flip.getState(galleryItem, {simple: true});
		
		// Create timeline for each gallery item
		const childTimeline = gsap.timeline()
		.add(() => {
			// Add the item to the 'next' navigation element
			navigation.addGalleryItems('next', galleryItem);
			// Flip animation
			Flip.from(flipstate, {
				duration: animationSettings.duration,
				ease: 'power4.inOut',
			});
		})
		// Scale animations
		.to(galleryItem, {
			duration: animationSettings.duration/2,
			ease: 'power4.in',
			scale: scaleFactor/2
		}, 0)
		.to(inner, {
			duration: animationSettings.duration/2,
			ease: 'power4.in',
			scale: 4
		}, 0)
		.to(galleryItem, {
			duration: animationSettings.duration/2,
			ease: 'power4',
			scale: 1
		})
		.to(inner, {
			duration: animationSettings.duration/2,
			ease: 'power4',
			scale: 1.6
		}, '<');

		// Add each galleryItem's timeline to parent timeline with delay
		parentTimeline.add(childTimeline, pos * animationSettings.itemDelay);
	});

	parentTimeline
	// A new label, 'afterInitialAnimation', is set at the moment when the last gallery item's animation is finished.
	.addLabel('afterInitialAnimation', loader.DOM.galleryItems.length * animationSettings.itemDelay + animationSettings.duration*0.3)
	// Animate the opacity of the next and previous arrows after all images are loaded.
	.fromTo([navigation.DOM.next.arrow, navigation.DOM.prev.arrow], {
		transformOrigin: pos => pos ? '100% 0%' : '0% 100%',
		scale: 0
	}, {
		duration: 1,
		ease: 'power4',
		scale: 1,
		opacity: 1
	}, 'afterInitialAnimation')
	// Adding all the gallery items of the last gallery to the 'prev' navigation element.
	.add(() => {
		navigation.addGalleryItems('prev', galleriesArr[totalGalleries-1].DOM.items);
	}, 'afterInitialAnimation')
	// And scale them up
	.fromTo(galleriesArr[totalGalleries-1].DOM.items, {
		scale: 0,
		opacity: 0,
	}, {
		duration: .3,
		ease: 'power4',
		stagger: {
			amount: animationSettings.duration-0.8
		},
		scale: 1,
		opacity: 1
	}, 'afterInitialAnimation')
	// Setting up the current gallery and adding the 'gallery--current' class to its element to animate its items in.
	.add(() => {
		// Show the gallery by adding gallery--current to the current gallery
		galleriesArr[current].DOM.el.classList.add('gallery--current');
		galleriesArr[current].isCurrent = true;
	},'afterInitialAnimation-=0.8');
	
	// Animate the gallery items in
	// Animate the inner images too
	let currentGalleryItems = galleriesArr[current].DOM.items;
	let innerImages = galleriesArr[current].DOM.items.map(item => item.querySelector('.gallery__item-inner'));
	// Animate the opacity and scale of the gallery items.
	parentTimeline
    .fromTo(currentGalleryItems, {
        opacity: 0,
        scale: 0
    }, {
        duration: animationSettings.duration,
        ease: 'power4.inOut',
        stagger: {
            each: animationSettings.itemDelay/2,
            from: 'random'
        },
        opacity: 1,
        scale: 1
    }, 'afterInitialAnimation-=0.8')
    // Here is a commented out section where the inner images could be animated.
	/*
    .fromTo(innerImages, {
        scale: 3
    }, {
        duration: animationSettings.duration,
        ease: 'power4.inOut',
        stagger: {
            each: animationSettings.itemDelay/2,
            from: '0'
        },
        scale: 1
    }, 'afterInitialAnimation-=0.8')
	*/
	// Animate the opacity of the .frame element.
	.to(DOM.frame, {
		duration: animationSettings.duration,
		ease: 'power4.inOut',
		opacity: 1
	}, 'afterInitialAnimation-=0.8');
};

// Navigation
const navigate = direction => {
	if ( isAnimating ) return;
	isAnimating = true;

	// Current gallery items
	const currentGalleryItems = galleriesArr[current].DOM.items;

	let next = current < totalGalleries-1 ? current+1 : totalGalleries-1;
	let prev = current > 0 ? current-1 : totalGalleries-1;
	let newcurrent;
	let newnext;
	let newprev;
	if ( direction === 'next' ) {
		newcurrent = current < totalGalleries-1 ? current+1 : 0;
		newnext = newcurrent < totalGalleries-1 ? newcurrent+1 : 0;
		newprev = current;
	}
	else {
		newcurrent = current > 0 ? current-1 : totalGalleries-1;
		newprev = newcurrent > 0 ? newcurrent-1 : totalGalleries-1;
		newnext = current;
	}
	
	// Upcoming gallery items
	const upcomingGalleryItems = galleriesArr[newcurrent].DOM.items;
	
	gsap
	.timeline({
		onComplete: () => {
			// Update current
			current = newcurrent;
			isAnimating = false;
		}
	})
	// Animate the non clicked navigation element' items out
	.to(navigation.DOM[direction === 'next' ? 'prev' : 'next'].galleryItems, {
		duration: .2,
		ease: 'power2.in',
		scale: 0,
		opacity: 0,
		onComplete: () => {
			// reset
			gsap.set(navigation.DOM[[direction === 'next' ? 'prev' : 'next']].galleryItems, {
				scale: 1,
				opacity: 1,
			});
			// Adding all the gallery items inside the nav 'prev' or 'next navigation element into the respective gallery.
			DOM.galleries[direction === 'next' ? prev : next].append(...navigation.DOM[[direction === 'next' ? 'prev' : 'next']].galleryItems);
		}
	}, 0)
	.add(() => {
		// Save the state of the current and upcoming gallery items at this point
		const flipCurrentState = Flip.getState(currentGalleryItems, {simple: true});
		const flipUpcomingState = Flip.getState(upcomingGalleryItems, {simple: true});

		// Reseting nav prev/next
		navigation.DOM[direction === 'next' ? 'prev' : 'next'].galleryItems = [];
		// Add the items to the 'prev'/'next' navigation element
		navigation.addGalleryItems(direction === 'next' ? 'prev' : 'next', currentGalleryItems);
		
		// Now animate all the current ones to the respective navigation element
		Flip.from(flipCurrentState, {
			duration: animationSettings.duration*.6,
			ease: 'power4',
			absolute: true,
			stagger: {
				each: animationSettings.itemDelay/2,
				from: direction === 'next' ? 'start' : 'end'
			}
		});
		
		// Show the gallery by adding gallery--current to the current gallery
		galleriesArr[newcurrent].DOM.el.classList.add('gallery--current');
		galleriesArr[current].DOM.el.classList.remove('gallery--current');
		galleriesArr[newcurrent].isCurrent = true;
		galleriesArr[current].isCurrent = false;
		
		// Reinsert upcoming items from 'next' or 'prev' navigation back into their respective gallery
		DOM.galleries[newcurrent].append(...upcomingGalleryItems);
		
		// Append items of the 'new next' or 'new prev' gallery to the 'next' or 'prev' navigation element.
		navigation.DOM[direction].galleryItems = [];
		navigation.addGalleryItems(direction, galleriesArr[direction === 'next' ? newnext : newprev].DOM.items);
		
		// Now animate the ones inside the navigation element (the one clicked) to the center (new current ones)
		Flip.from(flipUpcomingState, {
			delay: 0.15,
			absolute: true,
			spin: true,
			duration: animationSettings.duration*.6,
			ease: 'power4',
			stagger: {
				each: animationSettings.itemDelay/2,
				from: 'end'
			}
		});
	})
	// Animate the navigation arrows out
	.to([navigation.DOM['next'].arrow, navigation.DOM['prev'].arrow], {
		duration: .2,
		ease: 'power1.in',
		scale: 0,
		opacity: 0
	}, 0)
	// A new label, 'afterInitialAnimation', is set at the moment when the last gallery item's animation is finished.
	.addLabel('afterInitialAnimation', currentGalleryItems.length * animationSettings.itemDelay/2 + animationSettings.duration*0.15)
	// Animate the items of the 'new next' or 'new prev' in
	.fromTo(galleriesArr[direction === 'next' ? newnext : newprev].DOM.items, {
		scale: 0,
		opacity: 0,
	}, {
		duration: .3,
		ease: 'power4',
		stagger: {
			amount: animationSettings.duration*.6-0.6
		},
		scale: 1,
		opacity: 1
	}, 'afterInitialAnimation')
	// Animate the navigation arrows in
	.to([navigation.DOM['next'].arrow, navigation.DOM['prev'].arrow], {
		duration: 1,
		ease: 'power4',
		scale: 1,
		opacity: 1
	}, 'afterInitialAnimation');
};

// Navigation events
navigation.DOM.next.el.addEventListener('click', () => navigate('next'));
navigation.DOM.prev.el.addEventListener('click', () => navigate('prev'));

// Hover events
galleriesArr
.flatMap(gallery => gallery.DOM.items.map(item => ({ item, gallery })))
.forEach(({ item, gallery }) => {

	item.addEventListener('mouseenter', () => {
		if ( !gallery.isCurrent || isAnimating ) return;
		
		const inner = item.querySelector('.gallery__item-inner');
		gsap.killTweensOf([item, inner]);

		gsap
		.timeline({
			defaults: {duration: 0.8, ease: 'power4'}
		})
		.fromTo(item, {
			filter: 'contrast(100%) brightness(100%) hue-rotate(0deg)'
		}, {
			filter: 'contrast(120%) brightness(800%) hue-rotate(180deg)',
			scale: 1.2
		}, 0)
		.to(inner, {
			scale: 1
		}, 0);
	});

	item.addEventListener('mouseleave', () => {
		if ( !gallery.isCurrent || isAnimating ) return;
		
		const inner = item.querySelector('.gallery__item-inner');
		gsap.killTweensOf([item, inner]);

		gsap
		.timeline({
			defaults: {duration: 0.5, ease: 'power4'}
		})
		.to(item, {
			scale: 1,
			filter: 'contrast(100%) brightness(100%) hue-rotate(0deg)'
		}, 0)
		.to(inner, {
			scale: 1.6
		}, 0)
	});

});

// This implementation uses a somewhat simulated preloading strategy for demonstration purposes.
// Rather than loading all images upfront, we first preload only a subset of images (those needed for the initial loading animation).
// The remaining images are then loaded in the background while the progress indicator animates from 0 to 100%.
// Note: In a real-world application, the strategy may be more tailored to the specific needs of the project.
// Here, the primary aim is to create a visually engaging loading sequence for demo purposes,
// rather than reflecting the actual loading progress. Thus, it may not be suitable for all use cases.
preloadImages(galleriesArr[current+1].DOM.items).then(() => {
	// Load all other images and show progress indicator. After everything is loaded, animate elements and show the current gallery and navigation controls
	loader.loadAssets('.gallery__item-inner').then(setupGalleryAnimation);
});