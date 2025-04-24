let link = document.querySelector('#dplink');
let input = document.querySelector('#dp');
let form = document.querySelector('#dpform');
let button = document.querySelector('#dpbutton');

link.addEventListener('click', function() {
    // input.value = '';
    input.click();
})

input.addEventListener("change", () => {
        form.submit();
})