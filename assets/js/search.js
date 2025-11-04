// MkDocs search integration for custom theme - Enhanced version
(function() {
  "use strict";

  var searchIndex = null;
  var lunrIndex = null;
  var recentSearches = [];
  var maxRecentSearches = 5;
  
  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    // Check for essential elements
    const searchInput = document.getElementById('mkdocs-search-query');
    const searchResultsContainer = document.getElementById('mkdocs-search-results');
    const searchModal = document.querySelector('[data-search-modal]');
    const searchToggleButtons = document.querySelectorAll('[data-search-toggle]');
    const searchCloseButton = document.querySelector('[data-search-close]');
    
    if (!searchInput || !searchResultsContainer) {
      console.error("MkDocs Search: Required elements not found");
      return;
    }
    
    // Show loading state
    searchResultsContainer.innerHTML = '<div class="search-loading"><div class="search-loading-spinner"></div><p>Loading search index...</p></div>';
    
    // Load recent searches from localStorage
    try {
      const stored = localStorage.getItem('mkdocs_recent_searches');
      if (stored) {
        recentSearches = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not load recent searches:', e);
    }
    
    // Load search index
    fetch(base_url + '/search/search_index.json')
      .then(response => response.json())
      .then(data => {
        searchIndex = data;
        console.log("Search index loaded successfully");
        initializeSearch();
      })
      .catch(error => {
        console.error("Failed to load search index:", error);
        searchResultsContainer.innerHTML = '<div class="search-error"><svg viewBox="0 0 16 16" width="24" height="24"><path fill="currentColor" d="M2.343 13.657A8 8 0 1 1 13.658 2.343 8 8 0 0 1 2.343 13.657ZM6.03 4.97a.751.751 0 0 0-1.042.018.751.751 0 0 0-.018 1.042L6.94 8 4.97 9.97a.749.749 0 0 0 .326 1.275.749.749 0 0 0 .734-.215L8 9.06l1.97 1.97a.749.749 0 0 0 1.275-.326.749.749 0 0 0-.215-.734L9.06 8l1.97-1.97a.749.749 0 0 0-.326-1.275.749.749 0 0 0-.734.215L8 6.94Z"></path></svg><p>Failed to load search index. Please refresh the page.</p></div>';
      });
    
    // Initialize search functionality
    function initializeSearch() {
      if (!searchIndex || typeof lunr === 'undefined') {
        console.error("Search initialization failed: missing index or lunr");
        return;
      }
      
      // Build lunr index
      lunrIndex = lunr(function() {
        this.field('title', { boost: 10 });
        this.field('text');
        this.ref('location');
        
        searchIndex.docs.forEach(function(doc) {
          this.add(doc);
        }, this);
      });
      
      // Show initial state
      showInitialState();
      
      // Show initial state
      showInitialState();
      
      // Handle search input
      var searchTimeout = null;
      searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        var query = e.target.value.trim();
        
        if (query.length === 0) {
          showInitialState();
          return;
        }
        
        // Show searching state
        searchResultsContainer.innerHTML = '<div class="search-searching"><div class="search-loading-spinner small"></div><p>Searching...</p></div>';
        
        // Debounce search
        searchTimeout = setTimeout(function() {
          performSearch(query);
          saveRecentSearch(query);
        }, 200);
      });
      
      // Enable keyboard navigation
      searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          var firstResult = searchResultsContainer.querySelector('.search-result-item a');
          if (firstResult) {
            firstResult.click();
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          navigateResults('down');
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          navigateResults('up');
        }
      });
    }
    
    // Show initial state with recent searches
    function showInitialState() {
      var html = '<div class="search-initial">';
      html += '<p class="search-hint">Start typing to search documentation...</p>';
      
      if (recentSearches.length > 0) {
        html += '<div class="search-recent">';
        html += '<h4>Recent Searches</h4>';
        html += '<ul>';
        recentSearches.forEach(function(term) {
          html += '<li><button class="search-recent-item" data-query="' + escapeHtml(term) + '">';
          html += '<svg viewBox="0 0 16 16" width="14" height="14"><path fill="currentColor" d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5a.75.75 0 0 1 1.5 0Z"></path></svg>';
          html += escapeHtml(term);
          html += '</button></li>';
        });
        html += '</ul>';
        html += '</div>';
      }
      
      html += '</div>';
      searchResultsContainer.innerHTML = html;
      
      // Add click handlers for recent searches
      document.querySelectorAll('.search-recent-item').forEach(function(button) {
        button.addEventListener('click', function() {
          var query = this.getAttribute('data-query');
          searchInput.value = query;
          searchInput.dispatchEvent(new Event('input'));
        });
      });
    }
    
    // Save recent search
    function saveRecentSearch(query) {
      if (!query || query.length < 2) return;
      
      // Remove if exists and add to front
      recentSearches = recentSearches.filter(function(term) { return term !== query; });
      recentSearches.unshift(query);
      
      // Keep only max recent searches
      if (recentSearches.length > maxRecentSearches) {
        recentSearches = recentSearches.slice(0, maxRecentSearches);
      }
      
      // Save to localStorage
      try {
        localStorage.setItem('mkdocs_recent_searches', JSON.stringify(recentSearches));
      } catch (e) {
        console.warn('Could not save recent searches:', e);
      }
    }
    
    // Navigate search results with arrow keys
    var selectedResultIndex = -1;
    function navigateResults(direction) {
      var results = searchResultsContainer.querySelectorAll('.search-result-item');
      if (results.length === 0) return;
      
      // Remove previous selection
      if (selectedResultIndex >= 0 && selectedResultIndex < results.length) {
        results[selectedResultIndex].classList.remove('selected');
      }
      
      // Update index
      if (direction === 'down') {
        selectedResultIndex = (selectedResultIndex + 1) % results.length;
      } else {
        selectedResultIndex = selectedResultIndex <= 0 ? results.length - 1 : selectedResultIndex - 1;
      }
      
      // Add new selection
      results[selectedResultIndex].classList.add('selected');
      results[selectedResultIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      
      // Update Enter key behavior
      searchInput.addEventListener('keydown', function enterHandler(e) {
        if (e.key === 'Enter' && selectedResultIndex >= 0) {
          e.preventDefault();
          results[selectedResultIndex].querySelector('a').click();
          searchInput.removeEventListener('keydown', enterHandler);
        }
      }, { once: true });
    }
    
    // Perform search and display results
    function performSearch(query) {
      selectedResultIndex = -1; // Reset selection
      
      try {
        // Add wildcard to make partial matches work better
        var searchQuery = query.split(' ').map(term => term + '*').join(' ');
        var results = lunrIndex.search(searchQuery);
        
        if (results.length === 0) {
          searchResultsContainer.innerHTML = '<div class="search-no-results"><svg viewBox="0 0 16 16" width="32" height="32"><path fill="currentColor" d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z"></path></svg><p>No results found for <strong>"' + escapeHtml(query) + '"</strong></p><p class="search-hint">Try different keywords or check your spelling</p></div>';
          return;
        }
        
        // Group results by section
        var groupedResults = {};
        results.slice(0, 20).forEach(function(result) {
          var doc = searchIndex.docs.find(d => d.location === result.ref);
          if (doc) {
            var section = doc.location.split('/')[0] || 'General';
            if (!groupedResults[section]) {
              groupedResults[section] = [];
            }
            groupedResults[section].push({
              doc: doc,
              score: result.score,
              result: result
            });
          }
        });
        
        // Display results header
        var totalResults = results.length;
        var html = '<div class="search-results-header">';
        html += '<p>Found <strong>' + totalResults + '</strong> result' + (totalResults !== 1 ? 's' : '') + ' for <strong>"' + escapeHtml(query) + '"</strong></p>';
        html += '</div>';
        
        html += '<div class="search-results-list">';
        
        // Display grouped results
        Object.keys(groupedResults).forEach(function(section) {
          var sectionResults = groupedResults[section];
          
          sectionResults.forEach(function(item) {
            var doc = item.doc;
            var score = item.score;
            var preview = getSearchPreview(doc.text, query);
            var category = getCategory(doc.location);
            
            html += '<div class="search-result-item">';
            html += '<a href="' + base_url + '/' + doc.location + '">';
            html += '<div class="search-result-header">';
            html += '<div class="search-result-title">' + highlightMatches(doc.title, query) + '</div>';
            if (category) {
              html += '<span class="search-result-category">' + escapeHtml(category) + '</span>';
            }
            html += '</div>';
            if (preview) {
              html += '<div class="search-result-preview">' + preview + '</div>';
            }
            html += '</a>';
            html += '</div>';
          });
        });
        
        html += '</div>';
        searchResultsContainer.innerHTML = html;
        
      } catch (error) {
        console.error("Search error:", error);
        searchResultsContainer.innerHTML = '<div class="search-error"><svg viewBox="0 0 16 16" width="24" height="24"><path fill="currentColor" d="M2.343 13.657A8 8 0 1 1 13.658 2.343 8 8 0 0 1 2.343 13.657ZM6.03 4.97a.751.751 0 0 0-1.042.018.751.751 0 0 0-.018 1.042L6.94 8 4.97 9.97a.749.749 0 0 0 .326 1.275.749.749 0 0 0 .734-.215L8 9.06l1.97 1.97a.749.749 0 0 0 1.275-.326.749.749 0 0 0-.215-.734L9.06 8l1.97-1.97a.749.749 0 0 0-.326-1.275.749.749 0 0 0-.734.215L8 6.94Z"></path></svg><p>An error occurred during search. Please try again.</p></div>';
      }
    }
    
    // Get category from location path
    function getCategory(location) {
      var parts = location.split('/');
      if (parts.length > 1) {
        return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      }
      return null;
    }
    
    // Highlight matching terms in title
    function highlightMatches(text, query) {
      if (!text) return '';
      var terms = query.toLowerCase().split(' ');
      var result = escapeHtml(text);
      
      terms.forEach(function(term) {
        if (term.length < 2) return;
        var regex = new RegExp('(' + escapeRegExp(term) + ')', 'gi');
        result = result.replace(regex, '<mark>$1</mark>');
      });
      
      return result;
    }
    
    // Get search preview with highlighted terms
    function getSearchPreview(text, query) {
      if (!text) return '';
      
      var terms = query.toLowerCase().split(' ');
      var lowerText = text.toLowerCase();
      var bestIndex = -1;
      var bestScore = 0;
      
      // Find best match location
      terms.forEach(function(term) {
        var index = lowerText.indexOf(term);
        if (index !== -1 && index < 300) {
          var score = 100 - index;
          if (score > bestScore) {
            bestScore = score;
            bestIndex = index;
          }
        }
      });
      
      if (bestIndex === -1) {
        return escapeHtml(text.substring(0, 150)) + '...';
      }
      
      // Extract preview around match
      var start = Math.max(0, bestIndex - 50);
      var end = Math.min(text.length, bestIndex + 150);
      var preview = text.substring(start, end);
      
      if (start > 0) preview = '...' + preview;
      if (end < text.length) preview = preview + '...';
      
      // Highlight matching terms
      terms.forEach(function(term) {
        var regex = new RegExp('(' + escapeRegExp(term) + ')', 'gi');
        preview = preview.replace(regex, '<mark>$1</mark>');
      });
      
      return preview;
    }
    
    // Utility functions
    function escapeHtml(text) {
      var div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    // Modal Toggle Logic
    const openSearch = () => {
      if (searchModal) {
        searchModal.classList.add('is-active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
          searchInput.focus();
          showInitialState();
        }, 50);
      }
    };
    
    const closeSearch = () => {
      if (searchModal) {
        searchModal.classList.remove('is-active');
        document.body.style.overflow = '';
        searchInput.value = '';
        selectedResultIndex = -1;
        showInitialState();
      }
    };
    
    // Add event listeners
    if (searchModal) {
      searchToggleButtons.forEach(button => button.addEventListener('click', openSearch));
      
      if (searchCloseButton) {
        searchCloseButton.addEventListener('click', closeSearch);
      }
      
      searchModal.addEventListener('click', (event) => {
        if (event.target === searchModal) closeSearch();
      });
      
      // Keyboard shortcuts - Ctrl+K or Cmd+K to open search
      document.addEventListener('keydown', (event) => {
        // Ctrl+K or Cmd+K (Mac) to open search
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
          event.preventDefault();
          if (!searchModal.classList.contains('is-active')) {
            openSearch();
          }
        }
        // Escape to close search
        else if (event.key === 'Escape' && searchModal.classList.contains('is-active')) {
          closeSearch();
        }
      });
    }
    
    console.log("Search initialized with keyboard shortcuts (Ctrl+K / Cmd+K)");
  });
})();