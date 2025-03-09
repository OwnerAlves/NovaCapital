document.addEventListener("DOMContentLoaded", function(){
  const toggleButton = document.getElementById("toggleButton");
  const sidebar = document.getElementById("sidebar");
  const tabs = document.querySelectorAll("#sidebar .sidebar-tabs li");
  const contents = document.querySelectorAll(".tab-content");
  const navButtonsDiv = document.querySelector('.nav-buttons');

  // Create and add overlay
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  document.body.appendChild(overlay);

  // Update toggle button functionality
  toggleButton.addEventListener("click", function(){
    sidebar.classList.toggle("open");
    overlay.classList.toggle("active");
  });

  // Close sidebar when clicking overlay
  overlay.addEventListener("click", function() {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
  });

  // Update tab click handler
  tabs.forEach(function(tab) {
    tab.addEventListener("click", function(){
      // Remove active state from all tabs
      tabs.forEach(function(t) {
        t.classList.remove("active");
      });
      // Activate clicked tab
      tab.classList.add("active");

      // Show corresponding content section
      const target = tab.getAttribute("data-tab");
      contents.forEach(function(content) {
        if(content.id === target) {
          content.classList.add("active");
        } else {
          content.classList.remove("active");
        }
      });

      // Close the sidebar and overlay after selection
      setTimeout(() => {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
      }, 300);

      // Show nav-buttons only when the initial tab is active
      if (target === "inicial") {
        navButtonsDiv.style.display = "flex";
      } else {
        navButtonsDiv.style.display = "none";
      }
    });
  });

  // Initial check: show nav-buttons only if the initial tab is active
  const activeContent = document.querySelector('.tab-content.active');
  if (activeContent && activeContent.id === "inicial") {
    navButtonsDiv.style.display = "flex";
  } else {
    navButtonsDiv.style.display = "none";
  }

  // Add navigation button functionality
  const navComprar = document.getElementById("navComprar");
  if (navComprar) {
    navComprar.addEventListener("click", function(){
      const tab = document.querySelector('#sidebar .sidebar-tabs li[data-tab="comprar"]');
      if(tab) tab.click();
    });
  }
  const navDownload = document.getElementById("navDownload");
  if (navDownload) {
    navDownload.addEventListener("click", function(){
      const tab = document.querySelector('#sidebar .sidebar-tabs li[data-tab="download"]');
      if(tab) tab.click();
    });
  }

  const apkMobileButton = document.getElementById("apkMobileButton");
  if (apkMobileButton) {
    apkMobileButton.addEventListener("click", function(e) {
      e.preventDefault();
      alert("O APK Mobile e as atualizações de data estão em desenvolvimento. Em breve estarão disponíveis.");
    });
  }

  // Add PIX modal functionality
  const pixButton = document.querySelector(".pix-button");
  if (pixButton) {
    const pixModal = document.getElementById("pixModal");
    const closeModal = pixModal.querySelector(".pix-modal-close");
    const copyPixButton = document.getElementById("copyPixButton");
    const pixCodeElem = document.getElementById("pixCode");

    pixButton.addEventListener("click", function(e) {
      e.preventDefault();
      pixModal.style.display = "block";
    });

    closeModal.addEventListener("click", function() {
      pixModal.style.display = "none";
    });

    copyPixButton.addEventListener("click", function() {
      const pixCode = pixCodeElem.innerText;
      navigator.clipboard.writeText(pixCode).then(function() {
        alert("Código PIX copiado!");
      }, function(err) {
        alert("Falha ao copiar o código PIX.");
      });
    });

    // Close modal if click occurs outside the modal content
    window.addEventListener("click", function(event) {
      if (event.target == pixModal) {
        pixModal.style.display = "none";
      }
    });
  }

  function copyIP() {
    const ip = "104.167.222.158:2519";
    navigator.clipboard.writeText(ip).then(function() {
      alert("IP copiado para a área de transferência!");
    }, function(err) {
      alert("Erro ao copiar o IP");
    });
  }

  // Advanced 3-step CAPTCHA verification
  const captchaModal = document.getElementById("captchaModal");
  if (captchaModal) {
    const captchaStep1 = document.getElementById("captchaStep1");
    const captchaStep2 = document.getElementById("captchaStep2");
    const captchaStep3 = document.getElementById("captchaStep3");
    // Step 1: Slider Challenge
    const sliderCaptcha = document.getElementById("sliderCaptcha");
    const sliderButton = document.getElementById("sliderButton");
    let isDragging = false;
    let startX = 0;
    
    sliderButton.addEventListener("mousedown", function(e) {
      isDragging = true;
      startX = e.clientX - sliderButton.offsetLeft;
    });
    
    document.addEventListener("mousemove", function(e) {
      if (!isDragging) return;
      let x = e.clientX - startX;
      const maxX = sliderCaptcha.offsetWidth - sliderButton.offsetWidth;
      if (x < 0) x = 0;
      if (x > maxX) x = maxX;
      sliderButton.style.left = x + "px";
      if (x >= maxX) {
        isDragging = false;
        sliderButton.style.left = maxX + "px";
        setTimeout(() => {
          captchaStep1.classList.remove("active");
          captchaStep2.classList.add("active");
        }, 300);
      }
    });
    
    document.addEventListener("mouseup", function(e) {
      if (!isDragging) return;
      const maxX = sliderCaptcha.offsetWidth - sliderButton.offsetWidth;
      let currentX = parseInt(sliderButton.style.left, 10) || 0;
      if (currentX < maxX) {
        sliderButton.style.left = "0px";
      }
      isDragging = false;
    });
    
    // Touch events for mobile support in Step 1
    sliderButton.addEventListener("touchstart", function(e) {
      isDragging = true;
      startX = e.touches[0].clientX - sliderButton.offsetLeft;
      e.preventDefault();
    });
    
    document.addEventListener("touchmove", function(e) {
      if (!isDragging) return;
      let x = e.touches[0].clientX - startX;
      const maxX = sliderCaptcha.offsetWidth - sliderButton.offsetWidth;
      if (x < 0) x = 0;
      if (x > maxX) x = maxX;
      sliderButton.style.left = x + "px";
      if (x >= maxX) {
        isDragging = false;
        sliderButton.style.left = maxX + "px";
        setTimeout(() => {
          captchaStep1.classList.remove("active");
          captchaStep2.classList.add("active");
        }, 300);
      }
      e.preventDefault();
    });
    
    document.addEventListener("touchend", function(e) {
      if (!isDragging) return;
      const maxX = sliderCaptcha.offsetWidth - sliderButton.offsetWidth;
      let currentX = parseInt(sliderButton.style.left, 10) || 0;
      if (currentX < maxX) {
        sliderButton.style.left = "0px";
      }
      isDragging = false;
    });
    
    // Step 2: Math Challenge - updated with random arithmetic
    const captchaMathVerify = document.getElementById("captchaMathVerify");
    const captchaMathAnswer = document.getElementById("captchaMathAnswer");
    const captchaMathError = document.getElementById("captchaMathError");
    
    // Generate random numbers between 1 and 10
    let random1 = Math.floor(Math.random() * 10) + 1;
    let random2 = Math.floor(Math.random() * 10) + 1;
    let correctAnswer = random1 + random2;
    
    // Update the challenge text dynamically
    const captchaMathQuestion = document.getElementById("captchaMathQuestion");
    if (captchaMathQuestion) {
      captchaMathQuestion.innerText = `Resolva o desafio: Quanto é ${random1} + ${random2}?`;
    }
    
    captchaMathVerify.addEventListener("click", function(){
      const answer = parseInt(captchaMathAnswer.value.trim(), 10);
      if (answer === correctAnswer) {
        captchaMathError.style.display = "none";
        captchaStep2.classList.remove("active");
        captchaStep3.classList.add("active");
      } else {
        captchaMathError.style.display = "block";
      }
    });
    
    // Step 3: Final Confirmation
    const captchaFinalButton = document.getElementById("captchaFinalButton");
    captchaFinalButton.addEventListener("click", function(){
      captchaModal.style.opacity = "0";
      captchaModal.style.transition = "opacity 0.5s";
      setTimeout(function(){
        captchaModal.style.display = "none";
      }, 500);
    });
  }
});