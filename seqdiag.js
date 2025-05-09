// Globals

let theSourceDoc = { dom: '', fileName: 'untitled.uml', isModified: false };

let xslSVG;

fetch('./svg.xsl')
  .then(response => {
    if (response.ok) {
      return response.text()
    } else {
      return Promise.reject('error: ' + response.status)
    }
  })
  .then(data => {
    const parser = new DOMParser();
    // assign to the global variable xslSVG above
    xslSVG = parser.parseFromString(data, 'application/xml');
    //console.log(xslSVG);
    loadEmptyDocument();
  })
  .catch(error => console.error(error));

// Functions
function loadEmptyDocument() {
    // initial empty doc
    const theEmptyTxt = `<?xml version="1.0"?>
<sequencediagml>
    <parameters>
        <hspacing>240</hspacing>
        <vspacing>20</vspacing>
        <max_t>30</max_t>
        <fontsize>12</fontsize>
        <objectfill>#FFFFFF</objectfill>
        <activitybarfill>#FFFFFF</activitybarfill>
    </parameters>
    <lifelinelist/>
    <messagelist/>
    <framelist/>
</sequencediagml>`;
    const parser = new DOMParser();
    theSourceDoc.dom = parser.parseFromString(theEmptyTxt, "application/xml");
    const xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(xslSVG);
    const theSvgDoc = xsltProcessor.transformToDocument(theSourceDoc.dom);
    const theSvgParent=document.getElementById('svg_parent');
    theSvgParent.innerHTML = '';
    theSvgParent.appendChild(theSvgDoc.documentElement);
}

function loadFileDocument() {
    const fileList = this.files;
    const file = fileList[0];
    //console.log(file.name);
    const reader = new FileReader();
    reader.onload = function(event) {
        const contents = event.target.result;
        const parser = new DOMParser();
        theSourceDoc.dom = parser.parseFromString(contents, "application/xml");
        theSourceDoc.isModified = false;
        theSourceDoc.fileName = file.name;
        closeDialogs();
        populateUi();
    };
    reader.readAsText(file);
}

function loadExampleDocument(event) {
    // a fixed hard-coded example doc
    const theExampleTxt = examples[event.target.id];
    const parser = new DOMParser();
    theSourceDoc.dom = parser.parseFromString(theExampleTxt, "application/xml");
    theSourceDoc.isModified = false;
    theSourceDoc.fileName = event.target.id + '.uml';
    closeDialogs();
    populateUi();
}

function closeDialogs() {
  hideFrameDialog();
  hideMessageDialog();
  hideLifelineDialog();
  hideLayoutDialog();
}

function getMaxT() {
  return theSourceDoc.dom.getElementsByTagName('max_t')[0].textContent;
}

function tAxisShow(event) {
  const btn = event.target;
  if (btn.textContent == 'Show t Axis') {
    btn.textContent = 'Hide t Axis';
  } else {
    btn.textContent = 'Show t Axis'
  }
  populateUi();
}

function populateUi() {
    const scaleFactor = document.getElementById('scaling').value;
    document.getElementById('scaleValue').innerText = Math.trunc(scaleFactor * 100) + '%';
    // theSourceDoc.dom and xslSVG are application globals
    const xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(xslSVG);

    xsltProcessor.setParameter(null, 'SCALEFACTOR', scaleFactor);
    if (document.getElementById('toggleScaleButton').textContent == 'Hide t Axis') {
      xsltProcessor.setParameter(null, 'SHOWSCALE', 'yes');
    }
    const theSvgDoc = xsltProcessor.transformToDocument(theSourceDoc.dom);
    const theSvgParent=document.getElementById('svg_parent');
    theSvgParent.innerHTML = '';
    theSvgParent.appendChild(theSvgDoc.documentElement);

    // re-apply any highlighted svg elements
    const lifelineIndex = document.getElementById('lifelineIdx');
    if (document.getElementById('lifelineDialog').style.visibility == 'visible') {
      const lifelineSvg = document.getElementById('lifeline_' + lifelineIndex.value);
      if (lifelineSvg != null) {
        //lifelineSvg.setAttributeNS(null, 'filter', 'url(#dropshadow)');
        lifelineSvg.setAttribute('stroke', 'blue');
      }
    }
    const messageIndex = document.getElementById('messageIdx')
    if (document.getElementById('messageDialog').style.visibility == 'visible') {
      const messageSvg = document.getElementById('message_' + messageIndex.value);
      if (messageSvg != null) {
        //messageSvg.setAttributeNS(null, 'filter', 'url(#dropshadow)');
        messageSvg.setAttribute('stroke', 'blue');
      }
    }
    const frameIndex = document.getElementById('frameIdx')
    if (document.getElementById('frameDialog').style.visibility == 'visible') {
      const frameSvg = document.getElementById('frame_' + frameIndex.value);
      if (frameSvg != null) {
        //frameSvg.setAttributeNS(null, 'filter', 'url(#dropshadow)');
        frameSvg.setAttribute('stroke', 'blue');
      }
    }

    populateLayoutDialog();

    const theLifelineList = document.getElementById('lifelines');
    // clear existing lifelines from select before re-populating
    const existingLifelines = document.getElementById('existingLifelineGroup');
    if (existingLifelines != null) {
      theLifelineList.removeChild(existingLifelines);
    }
    const optLifelineGroup = document.createElement('optgroup');
    optLifelineGroup.setAttribute('label', 'Edit or Delete');
    optLifelineGroup.setAttribute('id', 'existingLifelineGroup');

    // clear lifeline lists from message dialog
    const fromList = document.getElementById('fromLifeline');
    const fromSelectedOld = fromList.selectedIndex;
    fromList.innerHTML = '';
    const toList = document.getElementById('toLifeline');
    const toSelectedOld = toList.selectedIndex;
    toList.innerHTML = '';
    // clear from frame dialog
    const leftList = document.getElementById('leftLifeline');
    const leftSelectedOld = leftList.selectedIndex;
    leftList.innerHTML = '';
    const rightList = document.getElementById('rightLifeline');
    const rightSelectedOld = rightList.selectedIndex;
    rightList.innerHTML = '';

    const lifelineNodes = theSourceDoc.dom.getElementsByTagName("lifeline");
    if (lifelineNodes.length) {
      for (i = 0; i <lifelineNodes.length; i++) {
        const option = document.createElement("option");
        option.innerHTML = (i + 1).toString() + ". " + (lifelineNodes[i].getElementsByTagName("lifelinename")[0].textContent).substring(0, 15);
        option.value = i;
        optLifelineGroup.appendChild(option);
        // populate message dialog "from" and "to" lists
        fromList.appendChild(option.cloneNode(true));
        toList.appendChild(option.cloneNode(true));
        // populate frame dialog
        leftList.appendChild(option.cloneNode(true));
        rightList.appendChild(option.cloneNode(true));
        // add click handler to svg lifeline
        const lifelineSvg = document.getElementById('lifeline_' + i);
        lifelineSvg.addEventListener('click', showLifelineDialogSvg);
      }
      theLifelineList.appendChild(optLifelineGroup);
      theLifelineList.size = lifelineNodes.length + 3;
      fromList.selectedIndex = fromSelectedOld;
      toList.selectedIndex = toSelectedOld;
      leftList.selectedIndex = leftSelectedOld;
      rightList.selectedIndex = rightSelectedOld;
    }

    const theMessageList = document.getElementById('messages');
    // clear existing messages from select before re-populating
    const existingMessages = document.getElementById('existingMessageGroup');
    if (existingMessages != null) {
      theMessageList.removeChild(existingMessages);
    }
    const optMessageGroup = document.createElement('optgroup');
    optMessageGroup.setAttribute('label', 'Edit or Delete');
    optMessageGroup.setAttribute('id', 'existingMessageGroup');
    const messageNodes = theSourceDoc.dom.getElementsByTagName("message");
    if (messageNodes.length) {
      for (i = 0; i < messageNodes.length; i++) {
        const option = document.createElement("option");
        option.innerHTML = (i + 1).toString() + ". " + messageNodes[i].getElementsByTagName("messagetext")[0].textContent;
        option.value = i;
        optMessageGroup.appendChild(option);
        const messageSvg = document.getElementById('message_' + i);
        messageSvg.addEventListener('click', showMessageDialogSvg);
      }
      theMessageList.appendChild(optMessageGroup);
      theMessageList.size = messageNodes.length + 3;
    }

    const theFrameList = document.getElementById('frames');
    // clear existing frames from select before re-populating
    const existingFrames = document.getElementById('existingFrameGroup');
    if (existingFrames != null) {
      theFrameList.removeChild(existingFrames);
    }
    const optFrameGroup = document.createElement('optgroup');
    optFrameGroup.setAttribute('label', 'Edit or Delete');
    optFrameGroup.setAttribute('id', 'existingFrameGroup');
    const frameNodes = theSourceDoc.dom.getElementsByTagName("frame");
    if (frameNodes.length) {
      for (i = 0; i < frameNodes.length; i++) {
        const option = document.createElement("option");
        option.innerHTML = (i + 1).toString() + ". " + frameNodes[i].getAttribute('type') + ' ' + frameNodes[i].textContent;
        option.value = i;
        optFrameGroup.appendChild(option);
        const frameSvg = document.getElementById('frame_' + i);
        frameSvg.addEventListener('click', showFrameDialogSvg);
      }
      theFrameList.appendChild(optFrameGroup);
      theFrameList.size = frameNodes.length + 3;
    }            //context.scale(scaleFactor, scaleFactor);

    const fileBanner = document.getElementById('file_banner');
    fileBanner.innerText = theSourceDoc.fileName;
    if (theSourceDoc.isModified) {
      fileBanner.innerText += '*';
    }
}

function saveUmlDocument() {
    if (theSourceDoc.dom != null) {
      const filename = prompt('File will be saved in your browser Download directory.\nFile will be saved as: ', theSourceDoc.fileName);
      if (filename) {
        if (filename != theSourceDoc.fileName) {
          theSourceDoc.fileName = filename;
        }
        const s = new XMLSerializer();
        let content = s.serializeToString(theSourceDoc.dom);
        content = content.replace(/>\s*/g, '>');
        content = content.replace(/\s*</g, '<');
        // Create element with <a> tag
        const link = document.createElement("a");
        // Create a blob object with the file content which you want to add to the file
        const file = new Blob([content], { type: 'text/plain' });
        link.href = URL.createObjectURL(file);
        link.download = theSourceDoc.fileName;
        // Add click event to <a> tag to save file.
        link.click();
        URL.revokeObjectURL(link.href);

        theSourceDoc.isModified = false;
        const fileBanner = document.getElementById('file_banner');
        fileBanner.innerText = theSourceDoc.fileName;
      }
    }
}

function exportDocument(event) {
    if (theSourceDoc.dom != null) {
      const fileType = '.' + event.target.id;
      const exportFilename = prompt('File will be saved in your browser Download directory.\nFile will be saved as: ', theSourceDoc.fileName.replace(/\..*/g, fileType));
      if (exportFilename) {
        const xsltProcessor = new XSLTProcessor();
        xsltProcessor.importStylesheet(xslSVG);
        xsltProcessor.setParameter(null, 'BROWSERRENDER', 'no');
        const theSvgDoc = xsltProcessor.transformToDocument(theSourceDoc.dom);
        const s = new XMLSerializer();
        const contentSvg = s.serializeToString(theSvgDoc);
        const blobSvg = new Blob([contentSvg], { type: 'image/svg+xml' });
        const svgObjectUrl = URL.createObjectURL(blobSvg);
        // Create element with <a> tag
        const link = document.createElement("a");
        link.download = exportFilename;
        if(fileType == '.png') {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            console.log(document.getElementById('scaling').value);
            const scaleFactor = document.getElementById('scaling').value;
            // Set canvas dimensions (adjust as needed)
            canvas.width = img.width * scaleFactor;
            canvas.height = img.height * scaleFactor;
            context.fillStyle = "white";

            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0, canvas.width, canvas.height);
            link.href = canvas.toDataURL('image/png');
            // Add click event to <a> tag to save file.
            link.click();
            URL.revokeObjectURL(link.href);
          };
          img.onerror = () => {  console.error('Failed to load SVG image'); };
          img.src = svgObjectUrl;
        } else {
          link.href = URL.createObjectURL(blobSvg);
          // Add click event to <a> tag to save file.
          link.click();
          URL.revokeObjectURL(link.href);
        }

      }
    }
}

function showLifelineDialogSvg(event) {
  const lifelineIndex = event.target.parentElement.id.split('_')[1];
  showLifelineDialog(lifelineIndex);
}

function showLifelineDialogSelect(event) {
  showLifelineDialog(event.target.value);
}

function showLifelineDialog(lifelineIndex) {
  hideLifelineDialog();
  const maxT = getMaxT();
  document.getElementById('destroyT').setAttribute('max', maxT - 1);
  document.getElementById('bbar').setAttribute('max', maxT - 1);
  document.getElementById('ebar').setAttribute('max', maxT);
  if (isNaN(parseInt(lifelineIndex))) {
    resetLifelineDialog();
  } else {
    populateLifelineDialog(lifelineIndex);
    const lifelineSvg = document.getElementById('lifeline_' + lifelineIndex);
    //lifelineSvg.setAttributeNS(null, 'filter', 'url(#dropshadow)');
    lifelineSvg.setAttribute('stroke', 'blue');
  }
  document.getElementById('lifelineDialog').style.visibility = 'visible';
}

function resetLifelineDialog() {
  document.getElementById('lifelineDialogHeader').textContent = 'New Lifeline';
  document.getElementById('lifelineIdx').value = 'new';
  document.getElementById('lifelineType').selectedIndex = -1;log.
  document.getElementById('lifelineName').value = '';
  const barList = document.querySelectorAll('.barRow');
  for (i = 0; i < barList.length; i++) {
    barList[i].remove();
  }
  document.getElementById('ebar').value = '';
  document.getElementById('bbar').value = '';
  document.getElementById('showFiniteLifeline').checked = false;
  document.getElementById('finiteLifeline').style.display = 'none';
  document.getElementById('destroyT').value = '';
  document.getElementById('deleteLifelineDialogBtn').setAttribute('hidden', 'hidden');
  disableApplyLifelineDialog();
}

function populateLifelineDialog(lifelineIdx) {
  document.getElementById('lifelineDialogHeader').textContent = 'Edit Lifeline'
  const lifelineData = theSourceDoc.dom.getElementsByTagName("lifeline")[lifelineIdx];
//  const s = new XMLSerializer();
//  const content = s.serializeToString(lifelineData);
//  console.log(content);
  document.getElementById('lifelineIdx').value = lifelineIdx;
  document.getElementById('lifelineName').value = lifelineData.getElementsByTagName('lifelinename')[0].textContent;
  document.getElementById('lifelineType').value = lifelineData.getAttribute('type');
  const barData = lifelineData.getElementsByTagName('activitybars')[0].getElementsByTagName('activitybar');

  populateActivityBars(barData);

  if (lifelineData.getAttribute('destroy_t')) {
    document.getElementById('showFiniteLifeline').checked = true;
    document.getElementById('finiteLifeline').style.display = 'inline-block';
    document.getElementById('destroyT').value = lifelineData.getAttribute('destroy_t');
  } else {
    document.getElementById('showFiniteLifeline').checked = false;
    document.getElementById('finiteLifeline').style.display = 'none';
    document.getElementById('destroyT').value = '';
  }
  document.getElementById('deleteLifelineDialogBtn').removeAttribute('hidden');
  disableApplyLifelineDialog();
}

function populateActivityBars(barData) {
  const barList = document.querySelectorAll('.barRow');
  for (i = 0; i < barList.length; i++) {
    barList[i].remove();
  }
  const actBarTableBody =  document.getElementById('activityBarsRows');
  for (i = 0; i < barData.length; i++) {
    const barRowId = 'barRow_' + i;
    const delBtnId = 'delBtnRow_' + i;;
    actBarTableBody.insertAdjacentHTML('beforeend', '<tr id="' + barRowId +'" class="barRow"><td>' + barData[i].getAttribute('begin_t') + '</td><td>' + barData[i].getAttribute('end_t') + '</td><td><button id ="'+ delBtnId + '" class="delBar" value="' + i + '">-&nbsp;</button></td></tr>');
    document.getElementById(delBtnId).addEventListener("click", removeActivityBar, false);
  }
  document.getElementById('bbar').value = '';
  document.getElementById('ebar').value = '';
}

function hideLifelineDialog() {
  document.getElementById('lifelineDialog').style.visibility = 'hidden';
  const lifelineIndex = document.getElementById('lifelineIdx');
  const lifelineSvg = document.getElementById('lifeline_' + lifelineIndex.value);
  if (lifelineSvg != null) {
    //lifelineSvg.removeAttribute('filter');
    lifelineSvg.setAttribute('stroke', 'black');
  }
}

function enableApplyLifelineDialog() {
  // could do cross-field validations here
  if (document.getElementById('lifelineType').selectedIndex == '-1') {
    alert('please select a lifeline type');
  } else {
    document.getElementById('applyLifelineDialogBtn').disabled = false;
  }
}

function disableApplyLifelineDialog() {
  document.getElementById('applyLifelineDialogBtn').disabled = true;
}

function showMessageDialogSvg (event) {
  const messageIndex = event.target.parentElement.id.split('_')[1];
  showMessageDialog(messageIndex);
}
function showMessageDialogSelect (event) {
  showMessageDialog(event.target.value);
}

function showMessageDialog(messageIndex) {
  hideMessageDialog();
  const maxT = getMaxT();
  document.getElementById('tValue').setAttribute('max', maxT);
  document.getElementById('delayValue').value = '0';
  document.getElementById('rtValue').setAttribute('max', maxT);
  document.getElementById('showSyncResponse').style.display = "none";
  document.getElementById('syncResponse').style.display = "none";
  document.getElementById('showResponse').checked = false;
  document.getElementById('responseText').value = '';
  document.getElementById('rtValue').value = '';
  if (isNaN(parseInt(messageIndex))) {
    resetMessageDialog();
  } else {
    populateMessageDialog(messageIndex);
    const messageSvg = document.getElementById('message_' + messageIndex);
    //messageSvg.setAttributeNS(null, 'filter', 'url(#dropshadow)');
    messageSvg.setAttribute('stroke', 'blue');
  }
  document.getElementById('messageDialog').style.visibility = 'visible';
}

function resetMessageDialog() {
  document.getElementById('messageDialogHeader').textContent = 'New Message';
  document.getElementById('messageIdx').value = 'new';
  document.getElementById('messageType').selectedIndex = -1;
  document.getElementById('messageText').value = '';
  document.getElementById('tValue').value = '';
  document.getElementById('deleteMessageDialogBtn').setAttribute('hidden', 'hidden');
  document.getElementById('fromLifeline').selectedIndex = -1;
  document.getElementById('toLifeline').selectedIndex = -1;
  disableApplyMessageDialog();
}

function populateMessageDialog(messageIdx) {
  document.getElementById('messageDialogHeader').textContent = 'Edit Message';
  const messageData = theSourceDoc.dom.getElementsByTagName("message")[messageIdx];
//  const s = new XMLSerializer();
//  const content = s.serializeToString(lifelineData);
//  console.log(content);
  document.getElementById('messageIdx').value = messageIdx;
  document.getElementById('fromLifeline').selectedIndex = messageData.getAttribute('from');
  document.getElementById('messageType').value = messageData.getAttribute('type');
  messageTypeTailorDialog(messageData.getAttribute('type'));
  if (messageData.getAttribute('to') != null) {
    document.getElementById('toLifeline').selectedIndex = messageData.getAttribute('to');
  }
  document.getElementById('messageText').value = messageData.getElementsByTagName('messagetext')[0].textContent;
  document.getElementById('tValue').value = messageData.getAttribute('t');
  if (messageData.getAttribute('t_delay') != null) {
    document.getElementById('delayValue').value = messageData.getAttribute('t_delay');
  }
  if (messageData.getElementsByTagName('response').length) {
    document.getElementById('showResponse').checked = true;
    document.getElementById('syncResponse').style.display = "inline-block";
    const responseTag = messageData.getElementsByTagName('response')[0];
    document.getElementById('responseText').value = responseTag.textContent;
    document.getElementById('rtValue').value = responseTag.getAttribute('t');
  }
  document.getElementById('deleteMessageDialogBtn').removeAttribute('hidden');
  disableApplyMessageDialog();
}

function hideMessageDialog() {
  document.getElementById('messageDialog').style.visibility = 'hidden';
  const messageIndex = document.getElementById('messageIdx');
  //console.log(parseInt(messageIndex.value));
  const messageSvg = document.getElementById('message_' + messageIndex.value);
  if (messageSvg != null) {
    //messageSvg.removeAttribute('filter');
    messageSvg.setAttribute('stroke', 'black');
  }
}

function enableApplyMessageDialog() {
  // could do cross-field validations here
  if (document.getElementById('messageType').selectedIndex == '-1') {
    alert('please select a message type');
  } else {
    document.getElementById('applyMessageDialogBtn').disabled = false;
  }
}

function disableApplyMessageDialog() {
  document.getElementById('applyMessageDialogBtn').disabled = true;
}

function showFrameDialogSvg(event) {
  const frameIndex = event.target.parentElement.id.split('_')[1];
  showFrameDialog(frameIndex);
}

function showFrameDialogSelect(event) {
  showFrameDialog(event.target.value);
  //console.log(event.target.value);
}

function showFrameDialog(frameIndex) {
  hideFrameDialog();
  const maxT = getMaxT();
  document.getElementById('topT').setAttribute('max', maxT - 2);
  document.getElementById('bottomT').setAttribute('max', maxT);
  if (isNaN(parseInt(frameIndex))) {
    resetFrameDialog();
  } else {
    populateFrameDialog(frameIndex);
    const frameSvg = document.getElementById('frame_' + frameIndex);
    //frameSvg.setAttributeNS(null, 'filter', 'url(#dropshadow)');
    frameSvg.setAttribute('stroke', 'blue');
  }
  document.getElementById('frameDialog').style.visibility = 'visible';
}

function resetFrameDialog() {
  document.getElementById('frameDialogHeader').textContent = 'New Frame';
  document.getElementById('frameIdx').value = 'new';
  document.getElementById('frameType').selectedIndex = '-1';
  document.getElementById('frameText').value = '';
  document.getElementById('textWidth').value = '';
  document.getElementById('leftLifeline').selectedIndex = '-1';
  document.getElementById('rightLifeline').selectedIndex = '-1';
  document.getElementById('topT').value = '';
  document.getElementById('bottomT').value = '';
  document.getElementById('narrowFrame').checked = false;

  document.getElementById('newOperandT').value = '';
  document.getElementById('newOperandText').value = '';
  const operandList = document.querySelectorAll('.operandRow');
  for (i = 0; i < operandList.length; i++) {
    operandList[i].remove();
  }
  document.getElementById('sd-div').style.display = 'none';
  document.getElementById('non-sd-div').style.display = 'none';
  document.getElementById('operands').style.display = 'none';
  disableApplyFrameDialog();
}

function populateFrameDialog(frameIdx) {
  document.getElementById('frameDialogHeader').textContent = 'Edit Frame';
  const frameData = theSourceDoc.dom.getElementsByTagName("frame")[frameIdx];
  const s = new XMLSerializer();
  const content = s.serializeToString(frameData);
  document.getElementById('frameIdx').value = frameIdx;
  document.getElementById('frameType').value = frameData.getAttribute('type');
  frameTypeTailorDialog(frameData.getAttribute('type'));
  if (frameData.getElementsByTagName('operand')[0].textContent != null) { document.getElementById('frameText').value = frameData.getElementsByTagName('operand')[0].textContent; }
  if (frameData.getAttribute('widthfactor') != null) { document.getElementById('textWidth').value = frameData.getAttribute('widthfactor'); }
  if (frameData.getAttribute('left') != null) { document.getElementById('leftLifeline').selectedIndex = frameData.getAttribute('left'); }
  if (frameData.getAttribute('right') != null) { document.getElementById('rightLifeline').selectedIndex = frameData.getAttribute('right'); }
  if (frameData.getAttribute('top') != null) { document.getElementById('topT').value = frameData.getAttribute('top'); }
  if (frameData.getAttribute('bottom') != null) { document.getElementById('bottomT').value = frameData.getAttribute('bottom'); }
  if (frameData.getAttribute('narrow') == 'true') { document.getElementById('narrowFrame').checked = true; } else { document.getElementById('narrowFrame').checked = false; }
  const operandData = frameData.getElementsByTagName('operand');
  populateExtraOperands(operandData);
  document.getElementById('deleteFrameDialogBtn').removeAttribute('hidden');
  disableApplyFrameDialog();
}

function populateExtraOperands(operandData) {
  const operandList = document.querySelectorAll('.operandRow');
  for (i = 0; i < operandList.length; i++) {
    operandList[i].remove();
  }
  const operandTableBody =  document.getElementById('operandRows');

  // N.B we ignore 1st operand in loop below
  for (i = 1; i < operandData.length; i++) {
    const operandRowId = 'operand_' + i;
    const delOpBtnId = 'delOpBtnRow_' + i;;
    operandTableBody.insertAdjacentHTML('beforeend', '<tr id="' + operandRowId +'" class="operandRow"><td>' + operandData[i].getAttribute('t') + '</td><td>' + operandData[i].textContent + '</td><td><button id ="'+ delOpBtnId + '" class="delOperand" value="' + i + '">-&nbsp;</button></td></tr>');
    document.getElementById(delOpBtnId).addEventListener("click", removeOperand, false);
  }
  document.getElementById('newOperandT').value = '';
  document.getElementById('newOperandText').value = '';
}

function removeOperand(event) {
    const operandId = 'operand_' + event.target.value;
    document.getElementById(operandId).remove();
    enableApplyFrameDialog();
}

function hideFrameDialog() {
  document.getElementById('frameDialog').style.visibility = 'hidden';
  const frameIndex = document.getElementById('frameIdx');
  const frameSvg = document.getElementById('frame_' + frameIndex.value);
  if (frameSvg != null) {
    //frameSvg.removeAttribute('filter');
    frameSvg.setAttribute('stroke', 'black');
  }
}
function enableApplyFrameDialog() {
  // could do cross-field validations here
  if (document.getElementById('frameType').selectedIndex == '-1') {
    alert('please select a frame type');
  } else {
    document.getElementById('applyFrameDialogBtn').disabled = false;
  }
}

function disableApplyFrameDialog() {
  document.getElementById('applyFrameDialogBtn').disabled = true;
}
function startDragging(event) {
  document.addEventListener("mousemove", dragDialog);
}

function stopDragging(event) {
  document.removeEventListener("mousemove", dragDialog);
}

function dragDialog(event) {
  let dialog = event.target.parentElement;
  let styles = dialog.getBoundingClientRect();
  let left = styles.left;
  let top = styles.top;
  let height = styles.height;

  dialog.style.setProperty("left", `${left + event.movementX}px`);
  dialog.style.setProperty("top", `${top + event.movementY}px`);
}

function removeActivityBar(event) {
    const barId = 'barRow_' + event.target.value;
    document.getElementById(barId).remove();
    enableApplyLifelineDialog();
}

function bbarInput(event) {
  const ebar = document.getElementById('ebar');
  const ebarMinValue = parseInt(event.currentTarget.value) + 1;
  ebar.setAttribute('min', ebarMinValue);
  if (ebar.value < ebarMinValue) {
    ebar.value = ebarMinValue;
  }
  enableApplyLifelineDialog();
}

function toggleFiniteVisibility(event) {
  if(event.currentTarget.checked == true)
  {
    document.getElementById('finiteLifeline').style.display = "inline-block";
  } else {
    document.getElementById('finiteLifeline').style.display = "none";
    enableApplyLifelineDialog();
  }
}

function messageTypeTailorDialogHandler(event) {
  messageTypeTailorDialog(event.currentTarget.value);
}

function messageTypeTailorDialog(messageType) {
  switch (messageType) {
    case 'synchronous':
      document.getElementById('showSyncResponse').checked == false
      document.getElementById('showSyncResponse').style.display = "inline-block";
      document.getElementById('toLifeline').style.display = "inline-block";
      break;
    case 'reflexive':
      document.getElementById('showSyncResponse').style.display = "none";
      document.getElementById('syncResponse').style.display = "none";
      document.getElementById('toLifeline').style.display = "none";
      break;
    default:
      document.getElementById('showSyncResponse').style.display = "none";
      document.getElementById('syncResponse').style.display = "none";
      document.getElementById('toLifeline').style.display = "inline-block";
  }
  enableApplyMessageDialog();
}

function frameTypeTailorDialogHandler(event) {
  frameTypeTailorDialog(event.currentTarget.value);
}

function frameTypeTailorDialog(frameType) {
  switch (frameType) {
    case 'SD':
      document.getElementById('sd-div').style.display = "inline-block";
      document.getElementById('non-sd-div').style.display = "none";
      document.getElementById('operands').style.display = "none";
      break;
    case 'ALT':
    case 'SEQ':
    case 'PAR':
    case 'STRICT':
      document.getElementById('sd-div').style.display = "none";
      document.getElementById('non-sd-div').style.display = "inline-block";
      document.getElementById('operands').style.display = "inline-block";
      break;
    default:
      document.getElementById('sd-div').style.display = "none";
      document.getElementById('non-sd-div').style.display = "inline-block";
      document.getElementById('operands').style.display = "none";
  }
  enableApplyFrameDialog();
}

function toggleResponseVisibility(event) {
  if(event.currentTarget.checked == true)
  {
    document.getElementById('syncResponse').style.display = "inline-block";
  } else {
    document.getElementById('syncResponse').style.display = "none";
  }
  enableApplyMessageDialog();
}

function tValueInput(event) {
  const rtValue = document.getElementById('rtValue');
  const rtMinValue = parseInt(event.currentTarget.value) + 1;
  rtValue.setAttribute('min', rtMinValue);
  if (rtValue.value < rtMinValue) {
    rtValue.value = rtMinValue;
  }
  enableApplyMessageDialog();
}

function topTInput(event) {
  const bottomTValue = document.getElementById('bottomT');
  const bottomTMinValue = parseInt(event.currentTarget.value) + 2;
  bottomTValue.setAttribute('min', bottomTMinValue);
  const newOperandT = document.getElementById('newOperandT');
  newOperandT.setAttribute('min', bottomTMinValue);
  if (bottomTValue.value < bottomTMinValue) {
    bottomTValue.value = bottomTMinValue;
  }
  enableApplyFrameDialog();
}

function updateLifeline() {
  const xmlDoc = document.implementation.createDocument("", "", null);
  const newElement = xmlDoc.createElement('lifeline');
  const typeAttr = document.getElementById('lifelineType').value;
  newElement.setAttribute('type',typeAttr);
  if (document.getElementById('showFiniteLifeline').checked) {
    const destroyT = document.getElementById('destroyT').value;
    newElement.setAttribute('destroy_t',destroyT);
  }
  const newLifelineName = xmlDoc.createElement('lifelinename');
  const lifelineName = document.getElementById('lifelineName').value;
  const newLifelineNameText = xmlDoc.createTextNode(lifelineName);
  newLifelineName.appendChild(newLifelineNameText);
  newElement.appendChild(newLifelineName);

  const newActivityBars = xmlDoc.createElement('activitybars');
  const barList = document.querySelectorAll('.barRow');
  for (let i = 0; i < barList.length; i++) {
    const activityBar = xmlDoc.createElement('activitybar');
    const begin_tValue = barList[i].firstChild.textContent;
    const end_tValue = barList[i].children[1].textContent;
    activityBar.setAttribute('begin_t', begin_tValue);
    activityBar.setAttribute('end_t', end_tValue);
    newActivityBars.appendChild(activityBar);
  }
  // add new bar here - need to validate bbar value is a number
  let inserted = false;
  const newBegin_tValue = parseInt(document.getElementById('bbar').value);
  if (Number.isInteger(newBegin_tValue)) {
    const newActivityBar = xmlDoc.createElement('activitybar');
    const newEnd_tValue = parseInt(document.getElementById('ebar').value);
    newActivityBar.setAttribute('begin_t', newBegin_tValue);
    newActivityBar.setAttribute('end_t', newEnd_tValue);
    // all child nodes are of type activity bar
    for (let j = 0; j < newActivityBars.childNodes.length; j++) {
      if (newBegin_tValue < parseInt(newActivityBars.childNodes[j].getAttribute('begin_t'))) {
        newActivityBars.insertBefore(newActivityBar, newActivityBars.children[j]);
        inserted = true;
        break
      }
    }
    if (inserted == false) {
      newActivityBars.appendChild(newActivityBar);
    }
  }

  newElement.appendChild(newActivityBars);
  const lifelineIdx = document.getElementById('lifelineIdx');
  const lifelineList = theSourceDoc.dom.getElementsByTagName("lifelinelist")[0];
  if (isNaN(parseInt(lifelineIdx.value))) {
    // append if new.
    lifelineList.appendChild(newElement);
    // update Idx hidden text field
    lifelineIdx.value = lifelineList.getElementsByTagName("lifeline").length - 1;
  } else {
    // replace if existing
    theOldLifeline = lifelineList.getElementsByTagName('lifeline')[lifelineIdx.value];
    lifelineList.replaceChild(newElement, theOldLifeline);
  }
  const lifelineData = theSourceDoc.dom.getElementsByTagName('lifeline')[lifelineIdx.value]
  const barData = lifelineData.getElementsByTagName('activitybars')[0].getElementsByTagName('activitybar');
  populateActivityBars(barData);
  theSourceDoc.isModified = true;
  populateUi();
  disableApplyLifelineDialog();
}

function okLifeline() {
  if (document.getElementById('applyLifelineDialogBtn').disabled == false) {
    updateLifeline();
  }
  hideLifelineDialog();
}

function deleteLifeline () {
  const lifelineIdx = document.getElementById('lifelineIdx');
  const lifelineList = theSourceDoc.dom.getElementsByTagName('lifelinelist')[0];
  const lifeline2BRemoved = lifelineList.getElementsByTagName('lifeline')[lifelineIdx.value];
  lifelineList.removeChild(lifeline2BRemoved);
  theSourceDoc.isModified = true;
  populateUi();
  hideLifelineDialog();
}

function updateMessage() {
  let xmlDoc = document.implementation.createDocument("", "", null);
  let newElement = xmlDoc.createElement('message');
  const typeAttr = document.getElementById('messageType').value;
  const fromAttr = document.getElementById('fromLifeline').value;
  const tAttr = document.getElementById('tValue').value;
  const delayAttr = document.getElementById('delayValue').value;
  newElement.setAttribute('type',typeAttr);
  newElement.setAttribute('from',fromAttr);
  if (!(typeAttr == 'reflexive')) {
    const toAttr = document.getElementById('toLifeline').value;
    newElement.setAttribute('to',toAttr);
  }
  newElement.setAttribute('t',tAttr);
  newElement.setAttribute('t_delay',delayAttr);
  let newMessageText = xmlDoc.createElement('messagetext');
  const messageText = document.getElementById('messageText').value;
  const newMessageTextTextNode = xmlDoc.createTextNode(messageText);
  newMessageText.appendChild(newMessageTextTextNode);
  newElement.appendChild(newMessageText);
  if (typeAttr == 'synchronous' && document.getElementById('showResponse').checked == true) {
    let newResponse = xmlDoc.createElement('response');
    const tResponseAttr = document.getElementById('rtValue').value;
    newResponse.setAttribute('t', tResponseAttr);
    const responseText = document.getElementById('responseText').value;
    const newResponseTextNode = xmlDoc.createTextNode(responseText);
    newResponse.appendChild(newResponseTextNode);
    newElement.appendChild(newResponse);
  }
  let messageIdx = document.getElementById('messageIdx');

  const messageList = theSourceDoc.dom.getElementsByTagName("messagelist")[0];
  messages = messageList.getElementsByTagName('message')
  if (!(isNaN(parseInt(messageIdx.value)))) {
    const message2BRemoved = messages[messageIdx.value];
    messageList.removeChild(message2BRemoved);
  }
  let inserted = false;
  for (i = 0; i < messages.length; i++) {
    if (parseInt(tAttr) < parseInt(messages[i].getAttribute('t'))) {
      messageList.insertBefore(newElement, messages[i]);
      messageIdx.value = i;
      inserted = true;
      break;
    }
  }
  if (inserted == false) {
    messageIdx.value = messages.length;
    messageList.appendChild(newElement);
  }
  theSourceDoc.isModified = true;
  populateUi();
}


function okMessage() {
  if (document.getElementById('applyMessageDialogBtn').disabled == false) {
    updateMessage();
  }
  hideMessageDialog();
}

function deleteMessage () {
  const messageIdx = document.getElementById('messageIdx');
  const messageList = theSourceDoc.dom.getElementsByTagName('messagelist')[0];
  const message2BRemoved = messageList.getElementsByTagName('message')[messageIdx.value];
  messageList.removeChild(message2BRemoved);
  theSourceDoc.isModified = true;
  populateUi();
  hideMessageDialog();
}

function updateFrame() {
  let xmlDoc = document.implementation.createDocument("", "", null);
  let newElement = xmlDoc.createElement('frame');
  const frameTextValue = document.getElementById('frameText').value;
  const firstOperandTextNode = xmlDoc.createTextNode(frameTextValue);
  const firstOperand = xmlDoc.createElement('operand');
  firstOperand.setAttribute('t', document.getElementById('topT').value);
  firstOperand.appendChild(firstOperandTextNode);
  newElement.appendChild(firstOperand);

  const typeAttr = document.getElementById('frameType').value;
  newElement.setAttribute('type', typeAttr);
  switch (typeAttr) {
    case 'SD':
      newElement.setAttribute('widthfactor', document.getElementById('textWidth').value);
      break;
    case 'ALT':
    case 'SEQ':
    case 'PAR':
    case 'STRICT':
      // add any extra operands (first operand already added above)
      const operandList = document.querySelectorAll('.operandRow');
      for (let i = 0; i < operandList.length; i++) {
        const myOperand = xmlDoc.createElement('operand');
        const tValue = operandList[i].firstChild.textContent;
        const operandText = operandList[i].children[1].textContent;
        const operandTextNode = xmlDoc.createTextNode(operandText);
        myOperand.setAttribute('t', tValue);
        myOperand.appendChild(operandTextNode);
        newElement.appendChild(myOperand);
      }
      // is there a new operand to add?
      let inserted = false;
      const newOperandTValue = parseInt(document.getElementById('newOperandT').value);
      if (Number.isInteger(newOperandTValue)) {
        const newOperand = xmlDoc.createElement('operand');
        newOperand.setAttribute('t', newOperandTValue);
        const newOperandText = document.getElementById('newOperandText').value;
        const newOperandTextNode = xmlDoc.createTextNode(newOperandText);
        newOperand.appendChild(newOperandTextNode);
        for (let j = 0; j < newElement.childNodes.length; j++) {
          if (newOperandTValue < parseInt(newElement.childNodes[j].getAttribute('t'))) {
            newElement.insertBefore(newOperand, newElement.children[j]);
            inserted = true;
            break
          }
        }
        if (inserted == false) {
          newElement.appendChild(newOperand);
        }
      }
    default:
      newElement.setAttribute('left', document.getElementById('leftLifeline').value);
      newElement.setAttribute('right', document.getElementById('rightLifeline').value);
      newElement.setAttribute('top', document.getElementById('topT').value);
      newElement.setAttribute('bottom', document.getElementById('bottomT').value);
  }
  if (document.getElementById('narrowFrame').checked == true) {
    newElement.setAttribute('narrow', 'true');
  }
  const frameIdx = document.getElementById('frameIdx');
  const frameList = theSourceDoc.dom.getElementsByTagName("framelist")[0];
  if (isNaN(parseInt(frameIdx.value))) {
    // append if new.
    frameList.appendChild(newElement);
    // update Idx hidden text field
    frameIdx.value = frameList.childNodes.length - 1;
  } else {
    // replace if existing
    theOldFrame = frameList.getElementsByTagName('frame')[frameIdx.value];
    frameList.replaceChild(newElement, theOldFrame);
  }
  const frameData = theSourceDoc.dom.getElementsByTagName('frame')[frameIdx.value]
  const operandData = frameData.getElementsByTagName('operand');
  populateExtraOperands(operandData);
  theSourceDoc.isModified = true;
  populateUi();
  disableApplyFrameDialog();
}


function okFrame() {
  if (document.getElementById('applyFrameDialogBtn').disabled == false) {
    updateFrame();
  }
  hideFrameDialog();
}

function deleteFrame () {
  const frameIdx = document.getElementById('frameIdx');
  const frameList = theSourceDoc.dom.getElementsByTagName('framelist')[0];
  const frame2BRemoved = frameList.getElementsByTagName('frame')[frameIdx.value];
  frameList.removeChild(frame2BRemoved);
  theSourceDoc.isModified = true;
  populateUi();
  hideFrameDialog();
}

function showLayoutDialog() {
  populateLayoutDialog();
  document.getElementById('layoutDialog').style.visibility = 'visible';
}

function hideLayoutDialog() {
  document.getElementById('layoutDialog').style.visibility = 'hidden';
}

function populateLayoutDialog() {
    const hSpacing = document.getElementById('hSpacing');
    const hSpacingValue = document.getElementById('hSpacingValue');
    hSpacingValue.innerText = hSpacing.value = theSourceDoc.dom.getElementsByTagName("hspacing")[0].childNodes[0].nodeValue;

    const vSpacing = document.getElementById('vSpacing');
    const vSpacingValue = document.getElementById('vSpacingValue');
    vSpacingValue.innerText = vSpacing.value = theSourceDoc.dom.getElementsByTagName("vspacing")[0].childNodes[0].nodeValue;

    const maxT = document.getElementById('maxT');
    const maxTValue = document.getElementById('maxTValue');
    maxTValue.innerText = maxT.value = theSourceDoc.dom.getElementsByTagName("max_t")[0].childNodes[0].nodeValue;

    const fontSize = document.getElementById('fontSize');
    const fontSizeValue = document.getElementById('fontSizeValue');
    fontSizeValue.innerText = fontSize.value = theSourceDoc.dom.getElementsByTagName("fontsize")[0].childNodes[0].nodeValue;

    const objectSpan = document.getElementById('objectcolour');
    objectSpan.innerText = objectSpan.style.backgroundColor = theSourceDoc.dom.getElementsByTagName("objectfill")[0].childNodes[0].nodeValue;

    const activitybarSpan = document.getElementById('activitybarcolour');
    activitybarSpan.innerText = activitybarSpan.style.backgroundColor = theSourceDoc.dom.getElementsByTagName("activitybarfill")[0].childNodes[0].nodeValue;
}

function updateHSpacing(event) {
  const hspacing = theSourceDoc.dom.getElementsByTagName('hspacing')[0];
  hspacing.childNodes[0].nodeValue = event.target.value;
  theSourceDoc.isModified = true;
  document.getElementById('hSpacingValue').innerText = event.target.value;
  populateUi();
}

function updateVSpacing(event) {
  const vspacing = theSourceDoc.dom.getElementsByTagName('vspacing')[0];
  vspacing.childNodes[0].nodeValue = event.target.value;
  theSourceDoc.isModified = true;
  document.getElementById('vSpacingValue').innerText = event.target.value;
  populateUi();
}

function updateMaxT(event) {
  const max_t = theSourceDoc.dom.getElementsByTagName('max_t')[0];
  max_t.childNodes[0].nodeValue = event.target.value;
  theSourceDoc.isModified = true;
  document.getElementById('maxTValue').innerText = event.target.value;
  populateUi();
}

function updateFontSize(event) {
  const fontsize = theSourceDoc.dom.getElementsByTagName('fontsize')[0];
  fontsize.childNodes[0].nodeValue = event.target.value;
  theSourceDoc.isModified = true;
  document.getElementById('fontSizeValue').innerText = event.target.value;
  populateUi();
}

function addSwatch(currentValue, index, arr) {
  const newSwatch = document.createElement("div");
  newSwatch.setAttribute('id', this.id + '_' + index);
  newSwatch.setAttribute('class', 'swatch');
  newSwatch.style.backgroundColor = currentValue;
  this.appendChild(newSwatch);
  newSwatch.addEventListener('click', clickSwatch);
}

function clickSwatch(event) {
  let rgb = event.target.style.backgroundColor;
  let sep = rgb.indexOf(",") > -1 ? "," : " ";
  // Turn "rgb(r,g,b)" into [r,g,b]
  rgb = rgb.substr(4).split(")")[0].split(sep);

  let r = (+rgb[0]).toString(16),
      g = (+rgb[1]).toString(16),
      b = (+rgb[2]).toString(16);

  if (r.length == 1)
    r = "0" + r;
  if (g.length == 1)
    g = "0" + g;
  if (b.length == 1)
    b = "0" + b;
  //console.log(event.target.parentNode.id);
  if (event.target.parentNode.id == 'objectdiv') {
    updateFill("#" + r + g + b, 'object');
  }
  else if (event.target.parentNode.id == 'bardiv') {
    updateFill("#" + r + g + b, 'activitybar');
  }
}

function updateFill(fillcolour, thing) {
  const thingfill = theSourceDoc.dom.getElementsByTagName(thing + 'fill')[0];
  thingfill.childNodes[0].nodeValue = fillcolour;
  theSourceDoc.isModified = true;
  const thingSpan = document.getElementById(thing + 'colour');
  thingSpan.innerText = thingSpan.style.backgroundColor = fillcolour;
  populateUi();
}

function check4Changes (event) {
  if (theSourceDoc.isModified == true) {
    event.preventDefault();
    event.returnValue = 'You have unfinished changes!';
  }
}

function populateExampleList() {
  const exampleBody =  document.getElementById('example-list');
  Object.keys(examples).forEach(key => {
    exampleBody.insertAdjacentHTML('beforeend', '<a href="javascript:;" id="' + key + '">' + key + '</a>');
    document.getElementById(key).addEventListener("click", loadExampleDocument, false);
});
}

// Add handlers
document.onreadystatechange = () => {
  if (document.readyState === "complete") {
    // Top Menu
    const inputElement = document.getElementById("load_local");
    inputElement.addEventListener("change", loadFileDocument, false);
    const saveUmlElement = document.getElementById("save_uml");
    saveUmlElement.addEventListener("click", saveUmlDocument, false);
    const saveSvgElement = document.getElementById("svg");
    saveSvgElement.addEventListener("click", exportDocument, false);
    const savePngElement = document.getElementById("png");
    savePngElement.addEventListener("click", exportDocument, false);

    populateExampleList();

    document.addEventListener('mouseup', stopDragging);

    const scaling = document.getElementById('scaling');
    scaling.addEventListener('input', populateUi);

    const tAxisBtn = document.getElementById('toggleScaleButton');
    tAxisBtn.addEventListener('click', tAxisShow);

    const layoutBtn = document.getElementById('layoutButton')
    layoutBtn.addEventListener('click', showLayoutDialog);
    const hideLayoutBtn = document.getElementById('hideLayoutDialogBtn');
    hideLayoutBtn.addEventListener('click', hideLayoutDialog);

    const hSpacing = document.getElementById('hSpacing');
    hSpacing.addEventListener('input', updateHSpacing);
    const vSpacing = document.getElementById('vSpacing');
    vSpacing.addEventListener('input', updateVSpacing);
    const maxT = document.getElementById('maxT');
    maxT.addEventListener('input', updateMaxT);
    const fontSize = document.getElementById('fontSize');
    fontSize.addEventListener('input', updateFontSize);
    const layoutDialogHeader = document.getElementById('layoutDialogHeader');
    layoutDialogHeader.addEventListener('mousedown', startDragging);

    const lifelines = document.getElementById('lifelines');
    lifelines.addEventListener('click', showLifelineDialogSelect);
    const lifelineDialogHeader = document.getElementById('lifelineDialogHeader');
    lifelineDialogHeader.addEventListener('mousedown', startDragging);
    const lifelineName = document.getElementById('lifelineName');
    lifelineName.addEventListener('change', enableApplyLifelineDialog);
    const lifelineType = document.getElementById('lifelineType');
    lifelineType.addEventListener('change', enableApplyLifelineDialog);
    const hideDialog = document.getElementById('cancelLifelineDialogBtn');
    hideDialog.addEventListener('click', hideLifelineDialog);
    const applyDialog = document.getElementById('applyLifelineDialogBtn');
    applyDialog.addEventListener('click', updateLifeline);
    const okDialog = document.getElementById('okLifelineDialogBtn');
    okDialog.addEventListener('click', okLifeline);
    const deleteDialog = document.getElementById('deleteLifelineDialogBtn');
    deleteDialog.addEventListener('click', deleteLifeline);
    const bbar = document.getElementById('bbar');
    bbar.addEventListener('input', bbarInput);
    const ebar = document.getElementById('ebar');
    ebar.addEventListener('input', enableApplyLifelineDialog);
    const showFinite = document.getElementById('showFiniteLifeline');
    showFinite.addEventListener('click', toggleFiniteVisibility);
    const destroyT = document.getElementById('destroyT');
    destroyT.addEventListener('input', enableApplyLifelineDialog);

    const messages = document.getElementById('messages');
    messages.addEventListener('click', showMessageDialogSelect);
    const messageDialogHeader = document.getElementById('messageDialogHeader');
    messageDialogHeader.addEventListener('mousedown', startDragging);
    const messageFrom = document.getElementById('fromLifeline');
    messageFrom.addEventListener('change', enableApplyMessageDialog);
    const messageTo = document.getElementById('toLifeline');
    messageTo.addEventListener('change', enableApplyMessageDialog);
    const messageText = document.getElementById('messageText');
    messageText.addEventListener('change', enableApplyMessageDialog);
    const messageT = document.getElementById('tValue');
    messageT.addEventListener('input', tValueInput);
    const delayT = document.getElementById('delayValue');
    delayT.addEventListener('change', enableApplyMessageDialog);
    const messageResponse = document.getElementById('responseText');
    messageResponse.addEventListener('change', enableApplyMessageDialog);
    const rtValue = document.getElementById('rtValue');
    rtValue.addEventListener('change', enableApplyMessageDialog);
    const hideMsgDialog = document.getElementById('cancelMessageDialogBtn');
    hideMsgDialog.addEventListener('click', hideMessageDialog);
    const messageType = document.getElementById('messageType');
    messageType.addEventListener('change', messageTypeTailorDialogHandler);
    const showResponse = document.getElementById('showResponse');
    showResponse.addEventListener('click', toggleResponseVisibility);
    const applyMDialog = document.getElementById('applyMessageDialogBtn');
    applyMDialog.addEventListener('click', updateMessage);
    const okMDialog = document.getElementById('okMessageDialogBtn');
    okMDialog.addEventListener('click', okMessage);
    const deleteMDialog = document.getElementById('deleteMessageDialogBtn');
    deleteMDialog.addEventListener('click', deleteMessage);

    const frames = document.getElementById('frames');
    frames.addEventListener('click', showFrameDialogSelect);
    const frameDialogHeader = document.getElementById('frameDialogHeader');
    frameDialogHeader.addEventListener('mousedown', startDragging);
    const frameTxt = document.getElementById('frameText');
    frameTxt.addEventListener('change', enableApplyFrameDialog);
    const textWidth = document.getElementById('textWidth');
    textWidth.addEventListener('change', enableApplyFrameDialog);
    const lftLiifeline = document.getElementById('leftLifeline');
    lftLiifeline.addEventListener('change', enableApplyFrameDialog);
    const rghtLifeline = document.getElementById('rightLifeline');
    rghtLifeline.addEventListener('change', enableApplyFrameDialog);

    const topT = document.getElementById('topT');
    topT.addEventListener('input', topTInput);
    const bottomT = document.getElementById('bottomT');
    bottomT.addEventListener('input', enableApplyFrameDialog);
    const narrowFrame = document.getElementById('narrowFrame');
    narrowFrame.addEventListener('change', enableApplyFrameDialog);
    const newOperandT = document.getElementById('newOperandT');
    newOperandT.addEventListener('change', enableApplyFrameDialog);
    const hideFDialog = document.getElementById('cancelFrameDialogBtn');
    hideFDialog.addEventListener('click', hideFrameDialog);
    const frameType = document.getElementById('frameType');
    frameType.addEventListener('change', frameTypeTailorDialogHandler);
    const applyFDialog = document.getElementById('applyFrameDialogBtn');
    applyFDialog.addEventListener('click', updateFrame);
    const okFDialog = document.getElementById('okFrameDialogBtn');
    okFDialog.addEventListener('click', okFrame);
    const deleteFDialog = document.getElementById('deleteFrameDialogBtn');
    deleteFDialog.addEventListener('click', deleteFrame);

    // nice pastel shades
    const swatchArray = ['#FFFFFF', '#E1E1E1', '#FAC8C8', '#E1E1C8', '#C8FAC8', '#C8E1E1', '#C8C8FA', '#E1C8E1'];
    const objectDiv = document.getElementById('objectdiv');
    swatchArray.forEach(addSwatch, objectDiv);
    const barDiv = document.getElementById('bardiv');
    swatchArray.forEach(addSwatch, barDiv);

    window.addEventListener("beforeunload", check4Changes);
  }
};
