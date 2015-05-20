'use strict';

var serviceApp = angular.module('myApp.services', []);

serviceApp.factory("LoadingView", [function(){
    var element = angular.element(document.querySelector("#overlay")),
        progress = angular.element(document.querySelector("#overlay-progress")),
        progressBar = angular.element(document.querySelector(".progress-bar"));
    return{
        show: function(){
            element.removeClass("hide");
        },
        hide: function(){
            element.addClass("hide");
        },
        showProgress: function(){
            progress.removeClass("hide");
        },
        hideProgress: function(){
            progress.addClass("hide");
        },
        updateProgressBar: function(currentValue, total){
            var percent = Math.floor((currentValue/total)*100);
            progressBar[0].style.width = percent + "%";
            progressBar[0].setAttribute("aria-valuenow", currentValue);
            progressBar[0].setAttribute("aria-valuemax", total);
            progressBar[0].innerText = currentValue + "/" + total + " (" + percent + "%)";
        }
    }
}]);