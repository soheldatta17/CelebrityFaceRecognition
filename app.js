Dropzone.autoDiscover = false;

function init() {
    let dz = new Dropzone("#dropzone", {
        url: "/",
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Drop an image here or click to upload",
        autoProcessQueue: false
    });
    
    dz.on("addedfile", function() {
        if (dz.files[1] != null) {
            dz.removeFile(dz.files[0]);
        }
        $("#error").hide();
        $("#resultHolder").hide();
        $("#divClassTable").hide();
    });

    dz.on("complete", function(file) {

        let url = "https://celebrityfacerecognitionbackend.onrender.com/classify_image";
    
        $.post(url, {
            image_data: file.dataURL
        }, function(data, status) {
            // Log the data received from the server
            console.log("Received data:", data);
    
            if (!data || data.length === 0) {
                $("#resultHolder").hide();
                $("#divClassTable").hide();
                $("#error").fadeIn();
                return;
            }
    
            let match = getBestMatch(data);
            if (match) {
                displayResults(match);
            } else {
                $("#error").fadeIn();
            }
        }).fail(function() {
            $("#error").text("An error occurred while processing the image. Please try again.").fadeIn();
        });
    });
    
    $("#submitBtn").on('click', function() {
        dz.processQueue();
    });
}

function getBestMatch(data) {
    let bestMatch = null;
    let highestScore = -1;

    for (let i = 0; i < data.length; i++) {
        let maxScore = Math.max(...data[i].class_probability);
        if (maxScore > highestScore) {
            bestMatch = data[i];
            highestScore = maxScore;
        }
    }
    return bestMatch;
}

function displayResults(match) {
    console.log("Displaying results for match:", match);
    document.querySelector("#winner").innerHTML = `Predicted Result : ${match.class.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`;
    $("#error").hide();
    $("#resultHolder").show();
    $("#divClassTable").show();

    $("#resultHolder").html($(`[data-player="${match.class}"]`).html());

    let classDictionary = match.class_dictionary;
    let highestScore = -1;

    for (let player in classDictionary) {
        let index = classDictionary[player];
        let score = match.class_probability[index];
        $(`#score_${player}`).html(score.toFixed(2) + " %");
        if (score > highestScore) {
            highestScore = score;
        }
    }

    for (let player in classDictionary) {
        let index = classDictionary[player];
        let score = match.class_probability[index];
        if (score === highestScore) {
            $(`#score_${player}`).addClass("highlight");
        } else {
            $(`#score_${player}`).removeClass("highlight");
        }
    }
}

$(document).ready(function() {
    console.log("Document ready!");
    $("#error").hide();
    $("#resultHolder").hide();
    $("#divClassTable").hide();
    init();
});
