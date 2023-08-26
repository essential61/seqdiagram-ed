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
        <max_t>20</max_t>
    </parameters>
    <lifelinelist/>
    <messagelist/>
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
        populateUi();
    };
    reader.readAsText(file);
}

function loadExampleDocument() {
    // a fixed hard-coded example doc
    const theExampleTxt = `<?xml version="1.0"?>
<sequencediagml>
    <parameters>
        <max_t>30</max_t>
    </parameters>
    <lifelinelist>
        <lifeline type="actor">
          <lifelinename>myactor</lifelinename>
          <activitybars>
            <activitybar begin_t="2" end_t="4"/>
            <activitybar begin_t="6" end_t="8"/>
          </activitybars>
        </lifeline>
        <lifeline type="object">
          <lifelinename>object 1</lifelinename>
          <activitybars/>
        </lifeline>
        <lifeline type="object">
          <lifelinename>object 2</lifelinename>
          <activitybars/>
        </lifeline>
        <lifeline type="object">
           <lifelinename>object 3</lifelinename>
          <activitybars/>
        </lifeline>
        <lifeline type="actor">
           <lifelinename>an actor</lifelinename>
          <activitybars/>
        </lifeline>
    </lifelinelist>
    <messagelist>
        <message type="asynchronous" from="1" to="2" t="3">
          <messagetext>a message</messagetext>
        </message>
        <message type="synchronous" from="2" to="3" t="5">
          <messagetext>mess</messagetext>
          <response t="7">blah</response>
        </message>
    </messagelist>
    <framelist>
      <frame type="SD" widthfactor="2">Example Sequence Diagram</frame>
      <frame type="LOOP" left="1" right="3" top="10" bottom="20">[loop condition]</frame>
    </framelist>
</sequencediagml>`;
    const parser = new DOMParser();
    theSourceDoc.dom = parser.parseFromString(theExampleTxt, "application/xml");
    theSourceDoc.isModified = false;
    theSourceDoc.fileName = 'example.uml';
    populateUi();
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
    // theSourceDoc.dom and xslSVG are application globals
    const xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(xslSVG);
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
        lifelineSvg.setAttributeNS(null, 'filter', 'url(#dropshadow)');
      }
    }
    const messageIndex = document.getElementById('messageIdx')
    if (document.getElementById('messageDialog').style.visibility == 'visible') {
      const messageSvg = document.getElementById('message_' + messageIndex.value);
      if (messageSvg != null) {
        messageSvg.setAttributeNS(null, 'filter', 'url(#dropshadow)');
      }
    }

    const maxT = document.getElementById('maxT');
    maxT.value = theSourceDoc.dom.getElementsByTagName("max_t")[0].childNodes[0].nodeValue;

    const theLifelineList = document.getElementById('lifelines');
    // clear existing lifelines from select before re-populating
    const existingLifelines = document.getElementById('existingLifelineGroup');
    if (existingLifelines != null) {
      theLifelineList.removeChild(existingLifelines);
    }
    let optLifelineGroup = document.createElement('optgroup');
    optLifelineGroup.setAttribute('label', 'Edit or Delete');
    optLifelineGroup.setAttribute('id', 'existingLifelineGroup');
    // clear lifeline lists from message dialog
    const fromList = document.getElementById('fromLifeline');
    const fromSelectedOld = fromList.selectedIndex;
    fromList.innerHTML = '';
    const toList = document.getElementById('toLifeline');
    const toSelectedOld = toList.selectedIndex;
    toList.innerHTML = '';
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
        // add click handler to svg lifeline
        const lifelineSvg = document.getElementById('lifeline_' + i);
        lifelineSvg.addEventListener('click', showLifelineDialogSvg);
      }
      theLifelineList.appendChild(optLifelineGroup);
      theLifelineList.size = lifelineNodes.length + 3;
      fromList.selectedIndex = fromSelectedOld;
      toList.selectedIndex = toSelectedOld;
    }

    const theMessageList = document.getElementById('messages');
    // clear existing lifelines from select before re-populating
    const existingMessages = document.getElementById('existingMessageGroup');
    if (existingMessages != null) {
      theMessageList.removeChild(existingMessages);
    }
    let optMessageGroup = document.createElement('optgroup');
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

    const fileBanner = document.getElementById('file_banner');
    fileBanner.innerText = theSourceDoc.fileName;
    if (theSourceDoc.isModified) {
      fileBanner.innerText += '*';
    }
}

function performTransform(myDoc, myTransform) {
    // Create an instance of the XSLTProcessor object
    const xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(myTransform);
    return xsltProcessor.transformToDocument(myDoc);
}

function saveUmlDocument() {
    if (theSourceDoc.dom != null) {
      let filename = prompt('File will be saved in your browser Download directory.\nFile will be saved as: ', theSourceDoc.fileName);
      if (filename) {
        if (filename != theSourceDoc.fileName) {
          theSourceDoc.fileName = filename;
        }
        const s = new XMLSerializer();
        const content = s.serializeToString(theSourceDoc.dom);
        //console.log(content);
        saveDocument(content, theSourceDoc.fileName);
        theSourceDoc.isModified = false;
        const fileBanner = document.getElementById('file_banner');
        fileBanner.innerText = theSourceDoc.fileName;
      }
    }
}

function saveSvgDocument() {
    if (theSourceDoc.dom != null) {
      let svgFilename = prompt('File will be saved in your browser Download directory.\nFile will be saved as: ', theSourceDoc.fileName.replace(/\..*/g, '.svg'))
      if (svgFilename) {
        const theSvgDoc = performTransform(theSourceDoc.dom, xslSVG);
        const s = new XMLSerializer();
        const contentSvg = s.serializeToString(theSvgDoc);
        saveDocument(contentSvg, svgFilename);
      }
    }
}

function saveDocument(content, fileName2Use) {
    // Create element with <a> tag
    const link = document.createElement("a");
    // Create a blob object with the file content which you want to add to the file
    const file = new Blob([content], { type: 'text/plain' });
    // Add file content in the object URL
    link.href = URL.createObjectURL(file);
    // Add file name
    link.download = fileName2Use;
    // Add click event to <a> tag to save file.
    link.click();
    URL.revokeObjectURL(link.href);
}
///////////////////////////
function showLifelineDialogSvg(event) {
  const lifelineIndex = event.target.parentElement.id.split('_')[1];
  showLifelineDialog(lifelineIndex);
}

function showLifelineDialogSelect(event) {
  showLifelineDialog(event.target.value);
}

function showLifelineDialog(lifelineIndex) {
  hideLifelineDialog();
  if (isNaN(parseInt(lifelineIndex))) {
    resetLifelineDialog();
  } else {
    populateLifelineDialog(lifelineIndex);
    const lifelineSvg = document.getElementById('lifeline_' + lifelineIndex);
    lifelineSvg.setAttributeNS(null, 'filter', 'url(#dropshadow)');
  }
  document.getElementById('lifelineDialog').style.visibility = 'visible';
}

function resetLifelineDialog() {
  document.getElementById('lifelineIdx').value = 'new';
  document.getElementById('lifelineName').value = '';
  document.getElementById('lifelineType').value = 'object';
  let barList = document.querySelectorAll('.barRow');
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
  const lifelineData = theSourceDoc.dom.getElementsByTagName("lifeline")[lifelineIdx];
//  const s = new XMLSerializer();
//  const content = s.serializeToString(lifelineData);
//  console.log(content);
  document.getElementById('lifelineIdx').value = lifelineIdx;
  document.getElementById('lifelineName').value = lifelineData.getElementsByTagName('lifelinename')[0].textContent;
  document.getElementById('lifelineType').value = lifelineData.getAttribute('type');
  let barList = document.querySelectorAll('.barRow');
  for (i = 0; i < barList.length; i++) {
    barList[i].remove();
  }
  const actBarTableBody =  document.getElementById('activityBarsRows');
  const barData = lifelineData.getElementsByTagName('activitybars')[0].getElementsByTagName('activitybar');
  for (i = 0; i < barData.length; i++) {
    const barRowId = 'barRow_' + i;
    const delBtnId = 'delBtnRow_' + i;;
    actBarTableBody.insertAdjacentHTML('beforeend', '<tr id="' + barRowId +'" class="barRow"><td>' + barData[i].getAttribute('begin_t') + '</td><td>' + barData[i].getAttribute('end_t') + '</td><td><button id ="'+ delBtnId + '" class="delBar" value="' + i + '">-&nbsp;</button></td></tr>');
    document.getElementById(delBtnId).addEventListener("click", removeActivityBar, false);
  }
  document.getElementById('bbar').value = '';
  document.getElementById('ebar').value = '';
  if (lifelineData.getAttribute('destroy_t')) {
    console.log(lifelineData.getAttribute('destroy_t'));
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

function hideLifelineDialog() {
  document.getElementById('lifelineDialog').style.visibility = 'hidden';
  const lifelineIndex = document.getElementById('lifelineIdx');
  // if (!(isNaN(parseInt(lifelineIndex.value)))) {
    const lifelineSvg = document.getElementById('lifeline_' + lifelineIndex.value);
    if (lifelineSvg != null) {
      lifelineSvg.removeAttribute('filter');
    }
  //}
}

function enableApplyLifelineDialog() {
  // could do cross-field validations here
  document.getElementById('applyLifelineDialogBtn').disabled = false;
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
    messageSvg.setAttributeNS(null, 'filter', 'url(#dropshadow)');
  }
  document.getElementById('messageDialog').style.visibility = 'visible';
}

function resetMessageDialog() {
  document.getElementById('messageIdx').value = 'new';
  document.getElementById('messageText').value = '';
  document.getElementById('tValue').value = '';
  document.getElementById('deleteMessageDialogBtn').setAttribute('hidden', 'hidden');
  document.getElementById('fromLifeline').selectedIndex = -1;
  document.getElementById('toLifeline').selectedIndex = -1;
  document.getElementById('messageType').selectedIndex = -1;
  disableApplyMessageDialog();
}

function populateMessageDialog(messageIdx) {
  const messageData = theSourceDoc.dom.getElementsByTagName("message")[messageIdx];
//  const s = new XMLSerializer();
//  const content = s.serializeToString(lifelineData);
//  console.log(content);
  document.getElementById('messageIdx').value = messageIdx;
  document.getElementById('fromLifeline').selectedIndex = messageData.getAttribute('from');
  if (messageData.getAttribute('type') == 'reflexive') {
    document.getElementById('toLifeline').style.display = "none";
  } else {
    document.getElementById('toLifeline').selectedIndex = messageData.getAttribute('to');
  }
  document.getElementById('messageText').value = messageData.getElementsByTagName('messagetext')[0].textContent;
  document.getElementById('tValue').value = messageData.getAttribute('t');
  document.getElementById('messageType').value = messageData.getAttribute('type');
  if (messageData.getAttribute('type') == 'synchronous') {
    document.getElementById('showSyncResponse').style.display = "inline-block";
    if (messageData.getElementsByTagName('response').length) {
      document.getElementById('showResponse').checked = true;
      document.getElementById('syncResponse').style.display = "inline-block";
      const responseTag = messageData.getElementsByTagName('response')[0];
      document.getElementById('responseText').value = responseTag.textContent;
      document.getElementById('rtValue').value = responseTag.getAttribute('t');
    }
  }
  document.getElementById('deleteMessageDialogBtn').removeAttribute('hidden');
  disableApplyMessageDialog();
}

function hideMessageDialog() {
  document.getElementById('messageDialog').style.visibility = 'hidden';
  const messageIndex = document.getElementById('messageIdx');
  //if (!(isNaN(parseInt(messageIndex.value)))) {
    console.log(parseInt(messageIndex.value));
    const messageSvg = document.getElementById('message_' + messageIndex.value);
    if (messageSvg != null) {
      messageSvg.removeAttribute('filter');
    }
 // }
}

function enableApplyMessageDialog() {
  // could do cross-field validations here
  document.getElementById('applyMessageDialogBtn').disabled = false;
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
  if (isNaN(parseInt(frameIndex))) {
    resetFrameDialog();
  } else {
    populateFrameDialog(frameIndex);
    const frameSvg = document.getElementById('frame_' + frameIndex);
    frameSvg.setAttributeNS(null, 'filter', 'url(#dropshadow)');
  }
  //const existingFrames = theSourceDoc.dom.getElementsByTagName("framelist")[0];
  //console.log(existingFrames.querySelector("[*|type = 'SD']"));
  document.getElementById('frameDialog').style.visibility = 'visible';
}

function resetFrameDialog() {
  document.getElementById('frameIdx').value = 'new';
  document.getElementById('frameType').selectedIndex = '-1';
  document.getElementById('leftLifeline').selectedIndex = '-1';
  document.getElementById('rightLifeline').selectedIndex = '-1';
  disableApplyFrameDialog();
}
function populateFrameDialog(frameIdx) {
  const messageData = theSourceDoc.dom.getElementsByTagName("frame")[messageIdx];
//  const s = new XMLSerializer();
//  const content = s.serializeToString(lifelineData);
//  console.log(content);
  document.getElementById('frameIdx').value = frameIdx;
  document.getElementById('deleteFrameDialogBtn').removeAttribute('hidden');
  disableApplyFrameDialog();
}
function hideFrameDialog() {
  document.getElementById('frameDialog').style.visibility = 'hidden';
  const frameIndex = document.getElementById('frameIdx');
  const frameSvg = document.getElementById('frame_' + frameIndex.value);
  if (frameSvg != null) {
    frameSvg.removeAttribute('filter');
  }
}
function enableApplyFrameDialog() {
  // could do cross-field validations here
  document.getElementById('applyFrameDialogBtn').disabled = false;
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

function addActivityBar(event) {
  // Validate values
  const sbar = document.getElementById('bbar');
  const ebar = document.getElementById('ebar');
  if (+bbar.value < 1 ) {
    alert("Begin activity is not set");
  } else if (+ebar.value  <= +bbar.value) {
    alert("End of activity must be after beginning activity");
  } else {
    const barList = document.querySelectorAll('.barRow');
    let existingIds = [];
    for (i = 0; i < barList.length; i++) {
      barList[i].getAttribute('barRowId_' + i);
      existingIds.push(i);
    }
    let j;
    for (j = barList.length; j > -1; j--) {
      if (!(existingIds.includes(j))) {
        break;
      }
    }
    const barRowId = 'barRow_' + j;
    const delBtnId = 'delBtnRow_' + j;
    const actBarTableBody =  document.getElementById('activityBars').getElementsByTagName('tbody')[0];
    actBarTableBody.insertAdjacentHTML('beforeend', '<tr id="' + barRowId +'" class="barRow"><td>' + bbar.value + '</td><td>' + ebar.value + '</td><td><button id ="'+ delBtnId + '" class="delBar" value="' + j + '">-</button></td></tr>');
    const theDelBtn = document.getElementById(delBtnId);
    theDelBtn.addEventListener("click", removeActivityBar, false);
    theDelBtn.style.width = '3ch';
    sbar.value = "";
    ebar.value = "";
    enableApplyLifelineDialog();
  }
}

function removeActivityBar(event) {
    const barId = 'barRow_' + event.target.value;
    document.getElementById(barId).remove();
    enableApplyLifelineDialog();
}

function toggleFiniteVisibility(event) {
  if(event.currentTarget.checked == true)
  {
    document.getElementById('finiteLifeline').style.display = "inline-block";
  } else {
    document.getElementById('finiteLifeline').style.display = "none";
  }
  enableApplyLifelineDialog();
}

function messageTypeTailorDialog(event) {
  const messageType = event.currentTarget.value;
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

function frameTypeTailorDialog(event) {
  const frameType = event.currentTarget.value;
  console.log(event.currentTarget.value);
  switch (frameType) {
    case 'SD':
      document.getElementById('sd-div').style.display = "inline-block";
      document.getElementById('non-sd-div').style.display = "none";
      document.getElementById('alt-div').style.display = "none";
      break;
    case 'ALT':
      document.getElementById('sd-div').style.display = "none";
      document.getElementById('non-sd-div').style.display = "inline-block";
      document.getElementById('alt-div').style.display = "inline-block";
      break;
    default:
      document.getElementById('sd-div').style.display = "none";
      document.getElementById('non-sd-div').style.display = "inline-block";
      document.getElementById('alt-div').style.display = "none";
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

function updateLifeline() {
  let xmlDoc = document.implementation.createDocument("", "", null);
  let newElement = xmlDoc.createElement('lifeline');
  const typeAttr = document.getElementById('lifelineType').value;
  newElement.setAttribute('type',typeAttr);
  if (document.getElementById('showFiniteLifeline').checked) {
    const destroyT = document.getElementById('destroyT').value;
    newElement.setAttribute('destroy_t',destroyT);
  }
  let newLifelineName = xmlDoc.createElement('lifelinename');
  const lifelineName = document.getElementById('lifelineName').value;
  const newLifelineNameText = xmlDoc.createTextNode(lifelineName);
  newLifelineName.appendChild(newLifelineNameText);
  newElement.appendChild(newLifelineName);

  let newActivityBars = xmlDoc.createElement('activitybars');
  const barList = document.querySelectorAll('.barRow');
  outerLoop:
  for (i = 0; i < barList.length; i++) {
    let newActivityBar = xmlDoc.createElement('activitybar');
    const begin_tValue = barList[i].firstChild.textContent;
    const end_tValue = barList[i].children[1].textContent;
    newActivityBar.setAttribute('begin_t', begin_tValue);
    newActivityBar.setAttribute('end_t', end_tValue);
    for (j = 0; j < newActivityBars.childNodes.length; j++) {
      if (begin_tValue < newActivityBars.childNodes[j].getAttribute('begin_t')) {
        alert(begin_tValue);
        newActivityBars.insertBefore(newActivityBar, newActivityBars.children[j]);
        continue outerLoop;
      }
    }
    newActivityBars.appendChild(newActivityBar);
  }
  newElement.appendChild(newActivityBars);
  //const s = new XMLSerializer();
  //const content = s.serializeToString(newElement);
  //console.log(content);
  const lifelineIdx = document.getElementById('lifelineIdx');
  const lifelineList = theSourceDoc.dom.getElementsByTagName("lifelinelist")[0];
  if (isNaN(parseInt(lifelineIdx.value))) {
    // append if new.
    lifelineList.appendChild(newElement);
    // update Idx hidden text field
    lifelineIdx.value = lifelineList.childNodes.length - 1;
  } else {
    // replace if existing
    theOldLifeline = lifelineList.getElementsByTagName('lifeline')[lifelineIdx.value];
    lifelineList.replaceChild(newElement, theOldLifeline);
  }
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
  newElement.setAttribute('type',typeAttr);
  newElement.setAttribute('from',fromAttr);
  if (!(typeAttr == 'reflexive')) {
    const toAttr = document.getElementById('toLifeline').value;
    newElement.setAttribute('to',toAttr);
  }
  newElement.setAttribute('t',tAttr);
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
  const typeAttr = document.getElementById('frameType').value;
  /*const fromAttr = document.getElementById('fromLifeline').value;
  const tAttr = document.getElementById('tValue').value;
  newElement.setAttribute('type',typeAttr);
  newElement.setAttribute('from',fromAttr);
  if (!(typeAttr == 'reflexive')) {
    const toAttr = document.getElementById('toLifeline').value;
    newElement.setAttribute('to',toAttr);
  }
  newElement.setAttribute('t',tAttr);
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
  }*/
  theSourceDoc.isModified = true;
  populateUi();
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

function updateMaxT(event) {
  const max_t = theSourceDoc.dom.getElementsByTagName('max_t')[0]
  max_t.childNodes[0].nodeValue = event.target.value;
  theSourceDoc.isModified = true;
  populateUi();
}

function check4Changes (event) {
  if (theSourceDoc.isModified == true) {
    event.preventDefault();
    event.returnValue = 'You have unfinished changes!';
  }
}

function sortDocument(doc2BSorted) {
  const theSortXslString = `<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:param name="SORT" select="@begin_t"</xsl:param>
  <xsl:strip-space elements="*"/>
  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates select="node()">
            <xsl:sort select="$SORT" data-type="number"/>
      </xsl:apply-templates>
    </xsl:copy>
  </xsl:template>
</xsl:stylesheet>`;
  const parser = new DOMParser();
  const theXslSort = parser.parseFromString(theSortXslString, 'application/xml');
  const xsltProcessor = new XSLTProcessor();
  xsltProcessor.importStylesheet(theXslSort);
  return xsltProcessor.transformToDocument(doc2BSorted);
}
// Add handlers
document.onreadystatechange = () => {
  if (document.readyState === "complete") {
    // Top Menu
    const inputElement = document.getElementById("load_local");
    inputElement.addEventListener("change", loadFileDocument, false);
    const exampleElement = document.getElementById("load_example");
    exampleElement.addEventListener("click", loadExampleDocument, false);
    const saveUmlElement = document.getElementById("save_uml");
    saveUmlElement.addEventListener("click", saveUmlDocument, false);
    const saveSvgElement = document.getElementById("save_svg");
    saveSvgElement.addEventListener("click", saveSvgDocument, false);
    document.addEventListener('mouseup', stopDragging);

    const tAxisBtn = document.getElementById('toggleScaleButton');
    tAxisBtn.addEventListener('click', tAxisShow);

    const maxT = document.getElementById('maxT');
    maxT.addEventListener('change', updateMaxT);

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
    const newActivityBar = document.getElementById('addBar');
    newActivityBar.addEventListener("click", addActivityBar, false);
    const showFinite = document.getElementById('showFiniteLifeline');
    showFinite.addEventListener('click', toggleFiniteVisibility);
    const destroyT = document.getElementById('destroyT');
    destroyT.addEventListener('change', enableApplyLifelineDialog);

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
    messageT.addEventListener('change', enableApplyMessageDialog);
    const messageResponse = document.getElementById('responseText');
    messageResponse.addEventListener('change', enableApplyMessageDialog);
    const rtValue = document.getElementById('rtValue');
    rtValue.addEventListener('change', enableApplyMessageDialog);
    const hideMsgDialog = document.getElementById('cancelMessageDialogBtn');
    hideMsgDialog.addEventListener('click', hideMessageDialog);
    const messageType = document.getElementById('messageType');
    messageType.addEventListener('change', messageTypeTailorDialog);
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

    const hideFDialog = document.getElementById('cancelFrameDialogBtn');
    hideFDialog.addEventListener('click', hideFrameDialog);
    const frameType = document.getElementById('frameType');
    frameType.addEventListener('change', frameTypeTailorDialog);
    const applyFDialog = document.getElementById('applyFrameDialogBtn');
    applyFDialog.addEventListener('click', updateFrame);
    const okFDialog = document.getElementById('okFrameDialogBtn');
    okFDialog.addEventListener('click', okFrame);
    const deleteFDialog = document.getElementById('deleteFrameDialogBtn');
    deleteFDialog.addEventListener('click', deleteFrame);

    window.addEventListener("beforeunload", check4Changes);
  }
};
