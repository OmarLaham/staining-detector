
$(document).ready(function() {
    $(".ddl-staining-method .dropdown-item").click(function() {

        const selectedVal = $(this).data("value");

        //set  value of input associated value field
        const inputField = $('#' + $(this).parent().parent().data("input-field"));
        $(inputField).val(selectedVal);


        if (selectedVal == "") {
            $(this).parent().parent().parent().find('button').text("Please Select:");
        } else {
            $(this).parent().parent().parent().find('button').text(selectedVal);
        }

    })

});

