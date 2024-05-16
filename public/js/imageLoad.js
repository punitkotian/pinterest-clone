const images = document.querySelectorAll("img[data-lazy]");

const lazyLoad = (image) => {
  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.getAttribute("data-lazy");

        img.setAttribute("src", src);
        img.classList.add("fade");

        observer.disconnect();
      }
    });
  });

  io.observe(image);
};

images.forEach(lazyLoad);
