/** 
 * Blackout Theme JavaScript
 * 
 * Includes:
 * - Sidebar Toggle (Left)
 * - Collapsible Navigation
 * - Search Modal Toggle & Initialization Hook
 * - Active Table of Contents Highlighting (Scroll Spy)
 */
document.addEventListener('DOMContentLoaded', () => {
    const bodyElement = document.body;

    // --- Utility Functions ---
    const throttle = (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    };

    // --- Sidebar Toggle ---
    const sidebarToggle = document.getElementById('bo-sidebar-toggle');
    const leftSidebar = document.querySelector('.bo-sidebar-left');
    const toggleSidebar = () => {
        if (leftSidebar) {
            const isCollapsed = leftSidebar.classList.toggle('is-collapsed');
            bodyElement.classList.toggle('bo-sidebar-is-collapsed', isCollapsed);
            bodyElement.classList.toggle('bo-sidebar-is-open', !isCollapsed);
            localStorage.setItem('blackout_sidebar_collapsed', isCollapsed ? 'true' : 'false');
        }
    };

    if (leftSidebar) {
        const isCollapsedPreferred = localStorage.getItem('blackout_sidebar_collapsed') === 'true';

        // Apply initial state without transition
        leftSidebar.style.transition = 'none';
        const contentArea = document.querySelector('.bo-content');
        if (contentArea) contentArea.style.transition = 'none';

        if (isCollapsedPreferred) {
            leftSidebar.classList.add('is-collapsed');
            bodyElement.classList.add('bo-sidebar-is-collapsed');
            bodyElement.classList.remove('bo-sidebar-is-open');
        } else {
            leftSidebar.classList.remove('is-collapsed');
            bodyElement.classList.remove('bo-sidebar-is-collapsed');
            bodyElement.classList.add('bo-sidebar-is-open');
        }

        // Force reflow before re-enabling transitions
        leftSidebar.offsetHeight; // Trigger reflow
        if (contentArea) contentArea.offsetHeight;

        // Re-enable transitions
        leftSidebar.style.transition = 'width var(--bo-transition-speed) ease-in-out, padding var(--bo-transition-speed) ease-in-out, border var(--bo-transition-speed) ease-in-out, opacity var(--bo-transition-speed) ease-in-out, transform var(--bo-transition-speed) ease-in-out';
        if (contentArea) {
            contentArea.style.transition = 'padding-left var(--bo-transition-speed) ease-in-out, padding-right var(--bo-transition-speed) ease-in-out';
        }
    } else {
        console.warn("Blackout Theme: Left sidebar element not found.");
    }

    if (sidebarToggle && leftSidebar) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    } else {
        if (!sidebarToggle) console.warn("Blackout Theme: Sidebar toggle button not found.");
    }

    // --- Improved Collapsible Navigation ---
    const navItemsWithChildren = document.querySelectorAll('.bo-nav-main .bo-nav-item.has-children'); 

    // Handle initial state
    navItemsWithChildren.forEach(item => {
        const link = item.querySelector(':scope > .bo-nav-link');
        const childList = item.querySelector(':scope > .is-child-list');

        if (link && childList) {
            // Check if this item or any child is active
            const isActiveBranch = item.querySelector('.is-active') !== null || item.classList.contains('is-active');

            if (isActiveBranch) {
                let current = item;
                while (current && current.classList.contains('bo-nav-item')) {
                    if (current.classList.contains('has-children')) {
                        current.classList.add('is-open'); // Expand active branch
                    }
                    current = current.parentElement?.closest('.bo-nav-item');
                }
            }

            // Handle click events for parent items with children
            link.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                
                // Close all other items at the same level
                const siblings = Array.from(item.parentElement.children).filter(
                    child => child !== item && child.classList.contains('has-children')
                );
                
                siblings.forEach(sibling => {
                    sibling.classList.remove('is-open');
                });
                
                // Toggle this item
                item.classList.toggle('is-open');
            });
        }
    });

    // Add click handler for navigation links that should maintain state
    const navLinks = document.querySelectorAll('.bo-nav-link:not(.has-children > .bo-nav-link)');
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            // Don't add special behavior for external links
            if (link.hasAttribute('target') && link.getAttribute('target') === '_blank') {
                return;
            }
            
            // Save sidebar state before navigation
            if (leftSidebar) {
                const isCollapsed = leftSidebar.classList.contains('is-collapsed');
                localStorage.setItem('blackout_sidebar_collapsed', isCollapsed ? 'true' : 'false');
            }
        });
    });

    // --- Search Integration ---
    const searchModal = document.getElementById('search-modal');
    const searchToggleButtons = document.querySelectorAll('[data-search-toggle]');
    const searchCloseButton = document.querySelector('[data-search-close]');
    const searchInput = document.getElementById('mkdocs-search-query');

    // Basic Modal Toggle Logic
    const openSearch = () => {
        if (searchModal) {
            searchModal.classList.add('is-active');
            bodyElement.style.overflow = 'hidden';
            if (searchInput) {
                setTimeout(() => searchInput.focus(), 50);
            }
        }
    };

    const closeSearch = () => {
        if (searchModal) {
            searchModal.classList.remove('is-active');
            bodyElement.style.overflow = '';
        }
    };

    if (searchModal) {
        searchToggleButtons.forEach(button => button.addEventListener('click', openSearch));
        if (searchCloseButton) searchCloseButton.addEventListener('click', closeSearch);
        
        searchModal.addEventListener('click', (event) => {
            if (event.target === searchModal) closeSearch();
        });
        
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && searchModal.classList.contains('is-active')) closeSearch();
        });
    }

    // --- Active Table of Contents Highlighting (Scroll Spy) ---
    const tocLinks = document.querySelectorAll('.bo-toc-link');
    const contentAreaScroll = document.querySelector('.bo-content'); // The scrollable area
    const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--bo-header-height') || '60px', 10);

    if (tocLinks.length > 0 && contentAreaScroll && window.IntersectionObserver) {
        let activeTocLink = null;
        let observer = null;

        const activateTocLink = (link) => {
            // Remove active class from all TOC links
            tocLinks.forEach(l => l.parentElement.classList.remove('is-active-toc'));

            if (link) {
                link.parentElement.classList.add('is-active-toc');
                activeTocLink = link;
            } else {
                activeTocLink = null;
            }
        };

        const callback = (entries) => {
            entries.forEach(entry => {
                const id = entry.target.getAttribute('id');
                const link = document.querySelector(`.bo-toc-link[href="#${id}"]`);

                if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                    // If intersecting more than 50%, activate it
                    activateTocLink(link);
                } else if (entry.boundingClientRect.top < headerHeight + 50 && !entry.isIntersecting) {
                    // If scrolled past (top is above viewport top + header offset)
                    if (activeTocLink === link) {
                        // Find next link in TOC to potentially activate
                        let nextLink = link.parentElement.nextElementSibling?.querySelector('.bo-toc-link');
                        
                        // Check if the next link's target is below the viewport top
                        if(nextLink) {
                            const nextTarget = document.getElementById(nextLink.getAttribute('href').substring(1));
                            if(nextTarget && nextTarget.getBoundingClientRect().top > headerHeight + 100) {
                                // Keep current link active if next section isn't close
                            }
                        }
                    }
                }
            });

            // Fallback if no section is clearly intersecting
            if ([...entries].every(e => !e.isIntersecting)) {
                // Find the topmost visible link based on target position
                let topmostVisibleLink = null;
                let minTop = Infinity;

                tocLinks.forEach(link => {
                    const targetId = link.getAttribute('href').substring(1);
                    const target = document.getElementById(targetId);
                    
                    if (target) {
                        const rect = target.getBoundingClientRect();
                        
                        // Consider visible if top is below header and within reasonable viewport area
                        if (rect.top >= headerHeight && rect.top < window.innerHeight / 2 && rect.top < minTop) {
                            minTop = rect.top;
                            topmostVisibleLink = link;
                        }
                    }
                });

                if (topmostVisibleLink && activeTocLink !== topmostVisibleLink) {
                    activateTocLink(topmostVisibleLink);
                } else if (!topmostVisibleLink && activeTocLink && contentAreaScroll.scrollTop < 100) {
                    // If near the top and nothing else is active, activate the first link
                    activateTocLink(tocLinks[0]);
                }
            }
        };

        // Observe all heading elements linked in the TOC
        observer = new IntersectionObserver(throttle(callback, 100), {
            root: null, // Use viewport as root
            rootMargin: `-${headerHeight}px 0px -40% 0px`, // Adjust top margin for header, bottom margin to trigger earlier
            threshold: [0, 0.5, 1.0] // Trigger at different visibility levels
        });

        tocLinks.forEach(link => {
            const targetId = link.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                const targetElement = document.getElementById(targetId.substring(1));
                if (targetElement) {
                    observer.observe(targetElement);
                }
            }
        });
    }
});