// Theme enhancements - Back to top, smooth scroll, etc.
(function() {
  "use strict";

  document.addEventListener('DOMContentLoaded', function() {
    
    // Create and add "Back to Top" button
    const backToTopButton = document.createElement('button');
    backToTopButton.className = 'bo-back-to-top';
    backToTopButton.setAttribute('aria-label', 'Back to top');
    backToTopButton.innerHTML = `
      <svg viewBox="0 0 16 16" width="20" height="20">
        <path fill="currentColor" d="M8 3.293l6.146 6.147a.5.5 0 0 0 .708-.708l-6.5-6.5a.5.5 0 0 0-.708 0l-6.5 6.5a.5.5 0 0 0 .708.708L8 3.293z"/>
      </svg>
    `;
    document.body.appendChild(backToTopButton);

    // Show/hide back to top button based on scroll
    let scrollTimeout;
    window.addEventListener('scroll', function() {
      clearTimeout(scrollTimeout);
      
      if (window.scrollY > 400) {
        backToTopButton.classList.add('visible');
      } else {
        backToTopButton.classList.remove('visible');
      }

      // Hide button while scrolling (optional smooth UX)
      backToTopButton.classList.add('scrolling');
      scrollTimeout = setTimeout(function() {
        backToTopButton.classList.remove('scrolling');
      }, 150);
    });

    // Smooth scroll to top on click
    backToTopButton.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    // Enhance anchor links with smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // Update URL without jumping
          if (history.pushState) {
            history.pushState(null, null, targetId);
          }
        }
      });
    });

    // Highlight current section in TOC on scroll
    const tocLinks = document.querySelectorAll('.bo-toc-link');
    const headings = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id]');
    
    if (tocLinks.length > 0 && headings.length > 0) {
      const observerOptions = {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0
      };

      const observerCallback = (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            
            // Remove active class from all TOC links
            tocLinks.forEach(link => link.classList.remove('active'));
            
            // Add active class to corresponding TOC link
            const activeLink = document.querySelector(`.bo-toc-link[href="#${id}"]`);
            if (activeLink) {
              activeLink.classList.add('active');
            }
          }
        });
      };

      const observer = new IntersectionObserver(observerCallback, observerOptions);
      headings.forEach(heading => observer.observe(heading));
    }

    // Add copy button to code blocks
    document.querySelectorAll('pre > code').forEach(codeBlock => {
      const pre = codeBlock.parentElement;
      
      // Create wrapper for positioning
      const wrapper = document.createElement('div');
      wrapper.className = 'bo-code-wrapper';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
      
      // Create copy button
      const copyButton = document.createElement('button');
      copyButton.className = 'bo-code-copy';
      copyButton.setAttribute('aria-label', 'Copy code');
      copyButton.innerHTML = `
        <svg viewBox="0 0 16 16" width="14" height="14">
          <path fill="currentColor" d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
          <path fill="currentColor" d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
        </svg>
        <span>Copy</span>
      `;
      
      wrapper.appendChild(copyButton);
      
      // Copy functionality
      copyButton.addEventListener('click', function() {
        const code = codeBlock.textContent;
        navigator.clipboard.writeText(code).then(() => {
          copyButton.classList.add('copied');
          copyButton.innerHTML = `
            <svg viewBox="0 0 16 16" width="14" height="14">
              <path fill="currentColor" d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path>
            </svg>
            <span>Copied!</span>
          `;
          
          setTimeout(() => {
            copyButton.classList.remove('copied');
            copyButton.innerHTML = `
              <svg viewBox="0 0 16 16" width="14" height="14">
                <path fill="currentColor" d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
                <path fill="currentColor" d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
              </svg>
              <span>Copy</span>
            `;
          }, 2000);
        }).catch(err => {
          console.error('Failed to copy code:', err);
        });
      });
    });

    // Add external link icons
    document.querySelectorAll('a[href^="http"]').forEach(link => {
      // Skip if it's an internal link or already has an icon
      if (link.hostname === window.location.hostname || 
          link.querySelector('svg') || 
          link.querySelector('img')) {
        return;
      }
      
      link.classList.add('bo-external-link');
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });

    console.log('Theme enhancements loaded');
  });
})();
