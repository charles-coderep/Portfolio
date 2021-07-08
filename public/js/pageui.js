let observeElements = document.querySelectorAll(".observe");
let PageObserver = new IntersectionObserver(function (entries) {
    // isIntersecting is true when element and viewport are overlapping
    // isIntersecting is false when element and viewport don't overlap
    entries.forEach(entry => {
        if (entry.isIntersecting) {

            if (entry.target.nodeName === "H2") {
                entry.target.classList.add('animate');
            }

            if (entry.target.hasChildNodes()) {
                let skillBarChildren = entry.target.children;
                for (let i = 0; i < skillBarChildren.length; i++) {
                    skillBarChildren[i].classList.add('animate');
                }
            }
        }
    });

}, { threshold: [1], rootMargin: "0px 0px -20% 0px" });

observeElements.forEach(observeElement => {
    PageObserver.observe(observeElement);
});
/*
let workWrappers = document.querySelectorAll(".work-wrapper");
workWrappers.forEach(element => {
    element.addEventListener("mouseenter", (e) => {
        console.log('mouseover');
    });
});*/