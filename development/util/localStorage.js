;
angular.module('app.storage', [])
.factory('$localstorage', ['$window', function($window) {
    // cordova.file.dataDirectory
    return {
        set: function(key, value) {
            save(key, value)
        },
        get: function(key, defaultValue) {
            return read(key) || defaultValue;
        },
        setObject: function(key, value) {
            save(key, JSON.stringify(JSON.decycle(value)))
        },
        getObject: function(key) {
            return JSON.retrocycle(JSON.parse(read(key) || '{}'));
        }
    };
    function read(key){
        return $window.localStorage[key];
        // if(typeof cordova === "undefined"){
        //     return $window.localStorage[key];
        // }else{
        //     return readFromFile(key);
        // }
    }
    function save(key, value){
        $window.localStorage[key] = value;
        // if(typeof cordova === "undefined"){
        //     $window.localStorage[key] = value;
        // }else{
        //     saveToFile(key, value);
        // }
    }
    function saveToFile(key, value){
        var fileName = key;
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (directoryEntry) {
            directoryEntry.getFile(fileName, { create: true }, function (fileEntry) {
                fileEntry.createWriter(function (fileWriter) {
                    fileWriter.onwriteend = function (e) {
                        // for real-world usage, you might consider passing a success callback
                        console.log('Write of file "' + fileName + '"" completed.');
                    };

                    fileWriter.onerror = function (e) {
                        // you could hook this up with our global error handler, or pass in an error callback
                        console.log('Write failed: ' + e.toString());
                    };

                    var blob = new Blob([value], { type: 'text/plain' });
                    fileWriter.write(blob);
                }, errorHandler.bind(null, fileName));
            }, errorHandler.bind(null, fileName));
        }, errorHandler.bind(null, fileName));
    }
    function errorHandler(fileName, e) {
        var msg = '';

        switch (e.code) {
            case FileError.QUOTA_EXCEEDED_ERR:
                msg = 'Storage quota exceeded';
                break;
            case FileError.NOT_FOUND_ERR:
                msg = 'File not found';
                break;
            case FileError.SECURITY_ERR:
                msg = 'Security error';
                break;
            case FileError.INVALID_MODIFICATION_ERR:
                msg = 'Invalid modification';
                break;
            case FileError.INVALID_STATE_ERR:
                msg = 'Invalid state';
                break;
            default:
                msg = 'Unknown error';
                break;
        };
        console.log('Error (' + fileName + '): ' + msg);
    }
    function readFromFile(key){
        console.log("read from file");
        var fileName = key;
        var pathToFile = cordova.file.dataDirectory + fileName;
        window.resolveLocalFileSystemURL(pathToFile, function (fileEntry) {
            fileEntry.file(function (file) {
                console.log("read file");
                var reader = new FileReader();

                reader.onloadend = function (e) {
                    console.log(this.result);
                    console.log("Read success: " + JSON.stringify(e));
                    return this.result;
                };
                reader.readAsText(file);
            }, errorHandler.bind(null, fileName));
        }, errorHandler.bind(null, fileName));
    }
}]);
