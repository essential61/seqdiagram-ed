// Globals
//let theSourceDoc;
let theSourceDoc = { dom: '', fileName: '', isModified: false };

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
      xslSVG = parser.parseFromString(data, 'application/xml');
      //console.log(xslSVG);
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
    <objectlist/>
    <messagelist/>
</sequencediagml>`;
    const parser = new DOMParser();
    theSourceDoc.dom = parser.parseFromString(theEmptyTxt, "application/xml");
}

function loadFileDocument() {
    const fileList = this.files;
    const file = fileList[0];
    console.log(file.name);
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
        <max_t>20</max_t>
    </parameters>
    <objectlist>
        <object type="actor">
          <objectname>myactor</objectname>
          <activitybars>
            <activitybar begin_t="2" end_t="4"/>
            <activitybar begin_t="6" end_t="8"/>
          </activitybars>
        </object>
        <object type="object">
          <objectname>object1</objectname>
          <activitybars/>
        </object>
        <object type="object">
          <objectname>object2</objectname>
          <activitybars/>
        </object>
        <object type="object">
           <objectname>object3</objectname>
          <activitybars/>
        </object>
        <object type="actor">
           <objectname>an actor</objectname>
          <activitybars/>
        </object>
    </objectlist>
    <messagelist>
        <message type="asynchronous" from="1" to="2" t="3">
          <messagetext>a message</messagetext>
        </message>
    </messagelist>
</sequencediagml>`;
    const parser = new DOMParser();
    theSourceDoc.dom = parser.parseFromString(theExampleTxt, "application/xml");
    theSourceDoc.isModified = false;
    theSourceDoc.fileName = 'example.uml';
    populateUi();
}

function populateUi() {
    // theSourceDoc.dom and xslSVG are application globals
    const theSvgDoc = performTransform(theSourceDoc.dom, xslSVG);
    const theSvgParent=document.getElementById('svg_parent');
    theSvgParent.innerHTML = '';
    theSvgParent.appendChild(theSvgDoc.documentElement);

    const maxT = document.getElementById('maxT');
    maxT.value = theSourceDoc.dom.getElementsByTagName("max_t")[0].childNodes[0].nodeValue;

    const theObjectList = document.getElementById('objects');
    // clear existing objects from select before re-populating
    const existingObjects = document.getElementById('existingObjectGroup');
    if (existingObjects != null) {
      theObjectList.removeChild(existingObjects);
    }
    let optObjectGroup = document.createElement('optgroup');
    optObjectGroup.setAttribute('label', 'Edit or Delete');
    optObjectGroup.setAttribute('id', 'existingObjectGroup');
    // clear object lists from message dialog
    const fromList = document.getElementById('fromObject');
    fromList.innerHTML = '';
    const toList = document.getElementById('toObject');
    toList.innerHTML = '';
    const objectNodes = theSourceDoc.dom.getElementsByTagName("object");
    if (objectNodes.length) {

      for (i = 0; i <objectNodes.length; i++) {
        const option = document.createElement("option");
        option.innerHTML = (i + 1).toString() + ". " + objectNodes[i].textContent;
        option.value = i;
        optObjectGroup.appendChild(option);
        // populate message dialog "from" and "to" lists
        fromList.appendChild(option.cloneNode(true));
        toList.appendChild(option.cloneNode(true));
      }
      theObjectList.appendChild(optObjectGroup);
      theObjectList.size = objectNodes.length + 3;
    }

    const theMessageList = document.getElementById('messages');
    // clear existing objects from select before re-populating
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
        option.innerHTML = (i + 1).toString() + ". " + messageNodes[i].textContent;
        option.value = i;
        optMessageGroup.appendChild(option);
      }
      theMessageList.appendChild(optMessageGroup);
      theMessageList.size = messageNodes.length + 3;
    }
    //const s = new XMLSerializer();
    //const str = s.serializeToString(theSourceDoc.dom);
    //console.log(str);
}

function performTransform(myDoc, myTransform) {
    // Create an instance of the XSLTProcessor object
    const xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(myTransform);
    return xsltProcessor.transformToDocument(myDoc);
}

function saveUmlDocument() {
    if (theSourceDoc.dom != null) {
      const s = new XMLSerializer();
      const content = s.serializeToString(theSourceDoc.dom);
      //console.log(content);
      saveDocument(content, theSourceDoc.fileName);
    }
}

function saveSvgDocument() {
    if (theSourceDoc.dom != null) {
      const theSvgDoc = performTransform(theSourceDoc.dom, xslSVG);
      const s = new XMLSerializer();
      const contentSvg = s.serializeToString(theSvgDoc);
      console.log(theSourceDoc.fileName.replace(/\..*/g, '.svg'));
      saveDocument(contentSvg, theSourceDoc.fileName.replace(/\..*/g, '.svg'));
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

function showObjectDialog(event) {
  const objectIndex = event.target.value
  if (isNaN(parseInt(objectIndex))) {
    resetObjectDialog();
  } else {
    populateObjectDialog(objectIndex);
  }
  document.getElementById('objectDialog').style.visibility = 'visible';
}

function resetObjectDialog() {
  document.getElementById('objectIdx').value = 'new';
  document.getElementById('objectName').value = '';
  document.getElementById('objectType').value = 'object';
  let barList = document.querySelectorAll('.barRow');
  for (i = 0; i < barList.length; i++) {
    barList[i].remove();
  }
  document.getElementById('ebar').value = '';
  document.getElementById('bbar').value = '';
  document.getElementById('deleteObjectDialogBtn').setAttribute('hidden', 'hidden');
  disableApplyObjectDialog();
}

function populateObjectDialog(objectIdx) {
  const objectData = theSourceDoc.dom.getElementsByTagName("object")[objectIdx];
//  const s = new XMLSerializer();
//  const content = s.serializeToString(objectData);
//  console.log(content);
  document.getElementById('objectIdx').value = objectIdx;
  document.getElementById('objectName').value = objectData.getElementsByTagName('objectname')[0].childNodes[0].nodeValue;
  document.getElementById('objectType').value = objectData.getAttribute('type');
  let barList = document.querySelectorAll('.barRow');
  for (i = 0; i < barList.length; i++) {
    barList[i].remove();
  }
  const actBarTableBody =  document.getElementById('activityBarsRows');
  const barData = objectData.getElementsByTagName('activitybars')[0].getElementsByTagName('activitybar');
  for (i = 0; i < barData.length; i++) {
    const barRowId = 'barRow_' + i;
    const delBtnId = 'delBtnRow_' + i;;
    actBarTableBody.insertAdjacentHTML('beforeend', '<tr id="' + barRowId +'" class="barRow"><td>' + barData[i].getAttribute('begin_t') + '</td><td>' + barData[i].getAttribute('end_t') + '</td><td><button id ="'+ delBtnId + '" class="delBar" value="' + i + '">-&nbsp;</button></td></tr>');
    document.getElementById(delBtnId).addEventListener("click", removeActivityBar, false);
  }
  document.getElementById('bbar').value = '';
  document.getElementById('ebar').value = '';
  document.getElementById('deleteObjectDialogBtn').removeAttribute('hidden');
  disableApplyObjectDialog();
}

function hideObjectDialog() {
  document.getElementById('objectDialog').style.visibility = 'hidden';
}

function enableApplyObjectDialog() {
  // could do cross-field validations here
  document.getElementById('applyObjectDialogBtn').disabled = false;
}

function disableApplyObjectDialog() {
  document.getElementById('applyObjectDialogBtn').disabled = true;
}

function showMessageDialog(event) {
  const messageIndex = event.target.value
  if (isNaN(parseInt(messageIndex))) {
    resetMessageDialog();
  } else {
    populateMessageDialog(messageIndex);
  }
  document.getElementById('messageDialog').style.visibility = 'visible';
}
function resetMessageDialog() {
  document.getElementById('messageIdx').value = 'new';
  document.getElementById('messageText').value = '';
  document.getElementById('tValue').value = '';
  document.getElementById('deleteMessageDialogBtn').setAttribute('hidden', 'hidden');
  disableApplyMessageDialog();
}

function populateMessageDialog(messageIdx) {
  const messageData = theSourceDoc.dom.getElementsByTagName("message")[messageIdx];
//  const s = new XMLSerializer();
//  const content = s.serializeToString(objectData);
//  console.log(content);
  document.getElementById('messageIdx').value = messageIdx;
  // TO DO check for out of bounds on select boxes
  document.getElementById('fromObject').selectedIndex = messageData.getAttribute('from');
  document.getElementById('toObject').selectedIndex = messageData.getAttribute('to');
  document.getElementById('messageText').value = messageData.getElementsByTagName('messagetext')[0].childNodes[0].nodeValue;
  document.getElementById('tValue').value = messageData.getAttribute('t');
  document.getElementById('messageType').value = messageData.getAttribute('type');
  if (messageData.getAttribute('type') == 'synchronous') {
    document.getElementById('rtValue').value = messageData.getElementsByTagName('response')[0].childNodes[0].nodeValue;;
  }
  document.getElementById('deleteMessageDialogBtn').removeAttribute('hidden');
  disableApplyMessageDialog();
}

function hideMessageDialog() {
  document.getElementById('messageDialog').style.visibility = 'hidden';
}

function enableApplyMessageDialog() {
  // could do cross-field validations here
  document.getElementById('applyMessageDialogBtn').disabled = false;
}

function disableApplyMessageDialog() {
  document.getElementById('applyMessageDialogBtn').disabled = true;
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
    alert("start of activity is not set");
  } else if (+ebar.value  <= +bbar.value) {
    alert("end of activity must be after start of activity");
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
    enableApplyObjectDialog();
  }
}

function removeActivityBar(event) {
    const barId = 'barRow_' + event.target.value;
    document.getElementById(barId).remove();
    enableApplyObjectDialog();
}

function toggleResponseVisibility(event) {
  if(event.currentTarget.value == "synchronous")
  {
    document.getElementById('syncResponse').style.display = "inline-block";
  } else {
    document.getElementById('syncResponse').style.display = "none";
  }
  enableApplyMessageDialog();
}

function updateObject() {
  let xmlDoc = document.implementation.createDocument("", "", null);
  let newElement = xmlDoc.createElement('object');
  const typeAttr = document.getElementById('objectType').value;
  newElement.setAttribute('type',typeAttr);
  let newObjectName = xmlDoc.createElement('objectname');
  const objectName = document.getElementById('objectName').value;
  const newObjectNameText = xmlDoc.createTextNode(objectName);
  newObjectName.appendChild(newObjectNameText);
  newElement.appendChild(newObjectName);

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
  const objectIdx = document.getElementById('objectIdx');
  const objectList = theSourceDoc.dom.getElementsByTagName("objectlist")[0];
  if (isNaN(parseInt(objectIdx.value))) {
    // append if new.
    objectList.appendChild(newElement);
    // update Idx hidden text field
    objectIdx.value = objectList.childNodes.length - 1;
  } else {
    // replace if existing
    theOldObject = objectList.getElementsByTagName('object')[objectIdx.value];
    objectList.replaceChild(newElement, theOldObject);
  }
  theSourceDoc.isModified = true;
  populateUi();
  disableApplyObjectDialog();
}

function okObject() {
  if (document.getElementById('applyObjectDialogBtn').disabled == false) {
    updateObject();
  }
  hideObjectDialog();
}

function deleteObject () {
  const objectIdx = document.getElementById('objectIdx');
  const objectList = theSourceDoc.dom.getElementsByTagName('objectlist')[0];
  const object2BRemoved = objectList.getElementsByTagName('object')[objectIdx.value];
  objectList.removeChild(object2BRemoved);
  theSourceDoc.isModified = true;
  populateUi();
  hideObjectDialog();
}

function updateMessage() {
  let xmlDoc = document.implementation.createDocument("", "", null);
  let newElement = xmlDoc.createElement('message');
  const typeAttr = document.getElementById('messageType').value;
  const fromAttr = document.getElementById('fromObject').value;
  const toAttr = document.getElementById('toObject').value;
  const tAttr = document.getElementById('tValue').value;
  newElement.setAttribute('type',typeAttr);
  newElement.setAttribute('from',fromAttr);
  newElement.setAttribute('to',toAttr);
  newElement.setAttribute('t',tAttr);
  let newMessageText = xmlDoc.createElement('messagetext');
  const messageText = document.getElementById('messageText').value;
  const newMessageTextTextNode = xmlDoc.createTextNode(messageText);
  newMessageText.appendChild(newMessageTextTextNode);
  newElement.appendChild(newMessageText);
  if (typeAttr == 'synchronous') {
    let newResponse = xmlDoc.createElement('response');
    const tResponseAttr = document.getElementById('rtValue').value;
    newResponse.setAttribute('t', tResponseAttr);
    const responseText = document.getElementById('responseText').value;
    const newResponseTextNode = xmlDoc.createTextNode(responseText);
    newReponse.appendChild(newResponseTextNode);
    newElement.appendChild(newResponse);
  }
  let messageIdx = document.getElementById('messageIdx');

  const messageList = theSourceDoc.dom.getElementsByTagName("messagelist")[0];
  messages = messageList.getElementsByTagName('message')
  if (!(isNaN(parseInt(messageIdx.value)))) {
    const message2BRemoved = messageList.getElementsByTagName('message')[message.Idx.value];
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

    const maxT = document.getElementById('maxT');
    maxT.addEventListener('change', updateMaxT);

    const objects = document.getElementById('objects');
    objects.addEventListener('click', showObjectDialog);

    const objectDialogHeader = document.getElementById('objectDialogHeader');
    objectDialogHeader.addEventListener('mousedown', startDragging);
    document.addEventListener('mouseup', stopDragging);

    const objectName = document.getElementById('objectName');
    objectName.addEventListener('change', enableApplyObjectDialog);
    const objectType = document.getElementById('objectType');
    objectType.addEventListener('change', enableApplyObjectDialog);
    const hideDialog = document.getElementById('cancelObjectDialogBtn');
    hideDialog.addEventListener('click', hideObjectDialog);
    const applyDialog = document.getElementById('applyObjectDialogBtn');
    applyDialog.addEventListener('click', updateObject);
    const okDialog = document.getElementById('okObjectDialogBtn');
    okDialog.addEventListener('click', okObject);
    const deleteDialog = document.getElementById('deleteObjectDialogBtn');
    deleteDialog.addEventListener('click', deleteObject);

    const newActivityBar = document.getElementById('addBar');
    newActivityBar.addEventListener("click", addActivityBar, false);

    const messageDialogHeader = document.getElementById('messageDialogHeader');
    messageDialogHeader.addEventListener('mousedown', startDragging);
    const messages = document.getElementById('messages');
    messages.addEventListener('click', showMessageDialog);

    const messageFrom = document.getElementById('fromObject');
    messageFrom.addEventListener('change', enableApplyMessageDialog);
    const messageTo = document.getElementById('toObject');
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
    messageType.addEventListener('change', toggleResponseVisibility);

    const applyMDialog = document.getElementById('applyMessageDialogBtn');
    applyMDialog.addEventListener('click', updateMessage);
    const okMDialog = document.getElementById('okMessageDialogBtn');
    okMDialog.addEventListener('click', okMessage);
    const deleteMDialog = document.getElementById('deleteMessageDialogBtn');
    deleteMDialog.addEventListener('click', deleteMessage);

    window.addEventListener("beforeunload", check4Changes);

    loadEmptyDocument();
  }
};
