const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 80;
    if (pageYOffset >= sectionTop) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
});

// Handle all "Get Started" buttons
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".get-started-btn");

  buttons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      // Prevent default for buttons, allow default for anchors with href
      if (btn.tagName === 'BUTTON') {
        e.preventDefault();
        window.location.href = "login.html";
      }
      // Anchors with href="login.html" will work automatically
    });
  });
});
