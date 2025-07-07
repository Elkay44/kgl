/**
 * KGL Express Components Loader
 * Dynamically loads header and footer components into all pages
 */

document.addEventListener('DOMContentLoaded', async function() {
  // Load header component
  const headerElement = document.querySelector('#header-component');
  if (headerElement) {
    try {
      const headerResponse = await fetch('/components/header.html');
      const headerContent = await headerResponse.text();
      headerElement.innerHTML = headerContent;

      // Set active navigation item based on current page
      const currentPath = window.location.pathname;
      
      const navLinks = {
        '/index.html': 'nav-home',
        '/pages/services/index.html': 'nav-services',
        '/pages/solutions/index.html': 'nav-solutions',
        '/pages/tracking/index.html': 'nav-tracking',
        '/pages/about/index.html': 'nav-about',
        '/pages/contact/index.html': 'nav-contact'
      };
      
      // Handle root path
      if (currentPath === '/' || currentPath === '') {
        document.getElementById('nav-home')?.classList.add('active');
      } else {
        // Find matching path and set active class
        Object.entries(navLinks).forEach(([path, id]) => {
          if (currentPath.endsWith(path)) {
            document.getElementById(id)?.classList.add('active');
          }
        });
      }
    } catch (error) {
      console.error('Error loading header component:', error);
    }
  }

  // Load footer component
  const footerElement = document.querySelector('#footer-component');
  if (footerElement) {
    try {
      const footerResponse = await fetch('/components/footer.html');
      const footerContent = await footerResponse.text();
      footerElement.innerHTML = footerContent;
    } catch (error) {
      console.error('Error loading footer component:', error);
    }
  }
});
