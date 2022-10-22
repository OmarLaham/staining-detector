
$(document).ready(function() {
    $("#ddl-staining-method .dropdown-item").click(function() {
        const selectedVal = $(this).data("value");
        $('input[name="input-staining-method-txt"]').val(selectedVal);
    })

});

