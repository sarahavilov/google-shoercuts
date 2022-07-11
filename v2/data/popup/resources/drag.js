var MT, BT, startId_G, startType_G, isDraging;
var dragIconContent = './icons/emptyCell.png';
var dragIcon = document.createElement('img');

dragIcon.src = dragIconContent;

function setDragIcon(dragIconContent) {dragIcon.src = dragIconContent;}

document.getElementById('main-div').addEventListener('mousedown', function (e) {
  var target = e.target || e.originalTarget;
  var type = target.getAttribute('type');
  if (target.localName == 'td' && type) {
    dragIconContent = './icons/' + target.getAttribute('type') + '.png';
    setDragIcon(dragIconContent);
  }
}, false);

function onDragStart(e) {
  isDraging = true;
  var target = e.target || e.originalTarget;
  
  MT = mainTypes.concat();
  BT = backupTypes.concat();
  e.dataTransfer.effectAllowed = 'move';
  startId_G = target.getAttribute('id');
  
  startType_G = target.getAttribute('type');
  e.dataTransfer.setDragImage(dragIcon, 32, 32);  
  if (startId_G.charAt(0) == 'm') {
    MT.splice(parseInt(startId_G.substring(1)), 1);
  }
  if (startId_G.charAt(0) == 'b') {
    BT.splice(parseInt(startId_G.substring(1)), 1);
  }
  e.dataTransfer.setData('gshortcuts/x-application', startId_G);
  tempDrop(e);
}

function onDragEnter(e) {
  if (!isDraging) return;
  var target = e.target || e.originalTarget;
  if (e.preventDefault) {e.preventDefault();}
  tempDrop(e);
}

function onDragOver(e) {
  if (!isDraging) return;
  var target = e.target || e.originalTarget;
  if (e.preventDefault) {e.preventDefault();}
  e.dataTransfer.dropEffect = 'move';
}

function onDragLeave(e) {
  if (!isDraging) return;
}

function onDrop(e) {
  if (!isDraging) return;
  if (!e.dataTransfer.getData("gshortcuts/x-application")) return;
  if (e.preventDefault) {e.preventDefault();}
  handleDrop(e, mainTypes, backupTypes);
  if (e.stopPropagation) {e.stopPropagation();}
}

function onDragend(e) {
  //In safari "onDragend" occurs before "onMouseup"
  window.setTimeout(function () {isDraging = false}, 500);
  if (e.preventDefault) {e.preventDefault();}
  init(mainTypes, 'shortcuts-table');
  init(backupTypes, 'backup-table');
}

function tempDrop(e) {
  MT = MT.filter(function (e) {return e && e != 'emptyCell'});
  BT = BT.filter(function (e) {return e && e != 'emptyCell'});
  
  var target = e.target || e.originalTarget;
  var endId = target.getAttribute('id');
  if (endId && endId.charAt(0) == 'm') {
    MT.splice(parseInt(endId.substring(1)), 0, 'emptyCell');
  }
  if (endId && endId.charAt(0) == 'b') {
    BT.splice(parseInt(endId.substring(1)), 0, 'emptyCell');
  }
  init(MT, 'shortcuts-table');
  init(BT, 'backup-table');
}

function handleDrop(e, mainTypes, backupTypes) {
  var startId = startId_G; startId_G = '';
  var startType = startType_G; startType_G = '';
  
  var target = e.target || e.originalTarget;
  var endId = target.getAttribute('id');
  var endType = target.getAttribute('type');
  
  if (!startId || !endId) return;
  
  var condition_1 = (startId.charAt(0) == 'm' && endId.charAt(0) == 'm'); // for main drag
  var condition_2 = (startId.charAt(0) == 'b' && endId.charAt(0) == 'b'); // for main drag
  var condition_3 = (startId.charAt(0) == 'm' && endId.charAt(0) == 'b'); // for total drag
  var condition_4 = (startId.charAt(0) == 'b' && endId.charAt(0) == 'm'); // for total drag

  if (condition_1 || condition_2) {
    startId = parseInt(startId.substring(1));
    endId = parseInt(endId.substring(1));
    if (startId >= 0 && endId >= 0 && startId != endId) {
      if (startId < endId) {
        if (condition_1) {
          mainTypes.splice(endId + 1, 0, startType);
          mainTypes.splice(startId, 1);
        } else {
          backupTypes.splice(endId + 1, 0, startType);
          backupTypes.splice(startId, 1);
        }
      } 
      else {
        if (condition_1) {
          mainTypes.splice(startId, 1);
          mainTypes.splice(endId, 0, startType);
        } else {
          backupTypes.splice(startId, 1);
          backupTypes.splice(endId, 0, startType);
        }
      }  
    }
  }
  else if (condition_3 || condition_4) {
    if (startType && startId != endId) {
      if (startId.charAt(0) == 'm' && endId.charAt(0) == 'b' && mainTypes.length > 1) {
        var endId = parseInt(endId.substring(1));
        if (!endType) endId = backupTypes.length - 1;
        var startId = parseInt(startId.substring(1));
        backupTypes.splice(endId, 0, startType);       // insert
        mainTypes.splice(startId, 1);                  // delete
      }
      else if (startId.charAt(0) == 'b' && endId.charAt(0) == 'm' && backupTypes.length > 1) {
        var endId = parseInt(endId.substring(1));
        if (!endType) endId = mainTypes.length - 1;
        var startId = parseInt(startId.substring(1));
        mainTypes.splice(endId, 0, startType);         // insert
        backupTypes.splice(startId, 1);                // delete
      }
    }
  }
  background.send('store-mainTypes', mainTypes);
  background.send('store-backupTypes', backupTypes);
}

document.getElementById('shortcuts-table').addEventListener('dragstart', onDragStart, false);
document.getElementById('shortcuts-table').addEventListener('dragenter', onDragEnter, false);
document.getElementById('shortcuts-table').addEventListener('dragover', onDragOver, false);
document.getElementById('shortcuts-table').addEventListener('dragleave', onDragLeave, false);
document.getElementById('shortcuts-table').addEventListener('drop', onDrop, false);
document.getElementById('shortcuts-table').addEventListener('dragend', onDragend, false);

document.getElementById('backup-table').addEventListener('dragstart', onDragStart, false);
document.getElementById('backup-table').addEventListener('dragenter', onDragEnter, false);
document.getElementById('backup-table').addEventListener('dragover', onDragOver, false);
document.getElementById('backup-table').addEventListener('dragleave', onDragLeave, false);
document.getElementById('backup-table').addEventListener('drop', onDrop, false);
document.getElementById('backup-table').addEventListener('dragend', onDragend, false);