(() => {
  let products = [];
  let favoritedProducts = [];

  const init = async () => {
    loadLocalStorageData();
    await sendRequests();
    buildHTML();
    buildCSS();
    setEvents();
  };

  // Cookie Operations
  const loadLocalStorageData = () => {
    favoritedProducts = getLocalStorageItem("mightLikeFavoriteData", [])
    products = getLocalStorageItem("mightLikeCachedProducts", []);
  }

  const getLocalStorageItem = (key, defaultValue) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data).data : defaultValue;
    } catch (error) {
      console.warn(`Failed to parse localStorage item ${key}:`, error);
      return defaultValue;
    }
  }

  const setLocalStorageItem = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify({ data: value }));
    } catch (error) {
      console.warn(`Failed to set localStorage item ${key}:`, error);
    }
  }

  const sendRequests = async () => {
    if (products.length === 0) {
      const url = "https://gist.githubusercontent.com/sevindi/5765c5812bbc8238a38b3cf52f233651/raw/56261d81af8561bf0a7cf692fe572f9e1e91f372/products.json";
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch products");
        products = await response.json();
        setLocalStorageItem("mightLikeCachedProducts", products);
      } catch (error) {
        console.error(`Error fetching products:`, error);
      }
    }
  }

  // Build HTML
  const extractOptionId = url => url.substring(url.lastIndexOf('/') + 1);

  const buildHTML = () => {
    const carouselContainer = $(`
      <div id="might-like-recommendation">
        <div class="recommendation-carousel">
            <div class="carousel-container">
              <p class="you-might-like-title">You Might Also Like</p>
              <div class="owl-carousel padded-carousel"></div>
            </div>
        </div>
      </div>
    `);

    $(".product-detail").after(carouselContainer);
    const owlCarousel = carouselContainer.find('.owl-carousel');

    products.forEach(product => {
      const optionId = extractOptionId(product.url);
      const isLiked = favoritedProducts.includes(optionId);

      const item = `
        <div class="new-product-card">
          <div class="new-product-card__image-wrapper">
            <a target="_blank" href="${product.url}">
              <img src="${product.img}" alt="${product.name}">
            </a>
            <div class="new-product-card-like-button ${isLiked ? 'new-product-card-like-button-fav' : ''}" optionid="${optionId}">
              <svg xmlns="https://w3.org/2000/svg" width="20.576" height="19.483" viewBox="0 0 20.576 19.483">
                <path fill="none" stroke="#555" stroke-width="1.5px" transform="translate(.756 -1.076)" d="M19.032 7.111c-.278-3.063-2.446-5.285-5.159-5.285a5.128 5.128 0 0 0-4.394 2.532 4.942 4.942 0 0 0-4.288-2.532C2.478 1.826.31 4.048.032 7.111a5.449 5.449 0 0 0 .162 2.008 8.614 8.614 0 0 0 2.639 4.4l6.642 6.031 6.755-6.027a8.615 8.615 0 0 0 2.639-4.4 5.461 5.461 0 0 0 .163-2.012z"></path>
              </svg>
            </div>
          </div>
          <div class="new-product-card__information-box">
            <div class="new-product-card__information-box__title">
              <a target="_blank" href="${product.url}">
                <p class="product-name">${product.name}</p>
              </a>
            </div>
            <div class="new-product-card__price">
              <div class="price__current-price">${product.price} TL</div>
            </div>
          </div>
        </div>
      `
      owlCarousel.append(item);
    })

    const prevButton = `
      <button type="button" aria-label="previous" class="carousel-arrow carousel-arrow-left">
        <svg xmlns="https://w3.org/2000/svg" width="14.242" height="24.242" viewBox="0 0 14.242 24.242">
          <path fill="none" stroke="#333" stroke-linecap="round" stroke-width="3px" d="M2106.842 2395.467l-10 10 10 10" transform="translate(-2094.721 -2393.346)"></path>
        </svg>
      </button>
    `
    const nextButton = `
      <button type="button" aria-label="next" class="carousel-arrow carousel-arrow-right rotate-180">
        <svg xmlns="http://www.w3.org/2000/svg" width="14.242" height="24.242" viewBox="0 0 14.242 24.242">
          <path fill="none" stroke="#333" stroke-linecap="round" stroke-width="3px" d="M2106.842 2395.467l-10 10 10 10" transform="translate(-2094.721 -2393.346)"></path>
        </svg>
      </button>
    `
    owlCarousel.owlCarousel({
      loop: false,
      nav: true,
      autoWidth: true,
      margin: 18,
      navText: [
        prevButton,
        nextButton
      ],
      smartSpeed: 800,
      onTranslated: function (event) {
        const carousel = event.target;
        const $carousel = $(carousel);

        const isFirstItemVisible = $carousel.find('.owl-prev').hasClass('disabled');
        const isLastItemVisible = $carousel.find('.owl-next').hasClass('disabled');

        $(".carousel-arrow-left").prop("disabled", isFirstItemVisible);
        $(".carousel-arrow-right").prop("disabled", isLastItemVisible);
      },
      responsive: {
        0: {
          margin: 34
        },
        993: {
          margin: 19
        }
      }
    });
  };

  const buildCSS = () => {
    const css = `
      .you-might-like-title {
        font-size: 32px;
        line-height: 43px;
        color: #29323b;
        font-weight: lighter;
        padding: 15px 0;
        margin: 0;
      }
      #might-like-recommendation {
        background-color: #faf9f7;
        position: relative;
      }
    `;

    $("<style>").addClass("carousel-style").html(css).appendTo("head");
  };

  const setEvents = () => {
    $(document).on("click", ".new-product-card-like-button", function () {
      const productId = $(this).attr("optionid");
      if($(this).hasClass('new-product-card-like-button-fav')) {
        favoritedProducts = favoritedProducts.filter(id => id !== productId);
      } else {
        favoritedProducts.push(productId);
      }
      setLocalStorageItem("mightLikeFavoriteData", favoritedProducts);
      $(this).toggleClass("new-product-card-like-button-fav");
    })
  }

  init();
})();
