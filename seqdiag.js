// Globals
//let theSourceDoc;
let theSourceDoc = { content: '', fileName: '', isModified: false };

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
    theSourceDoc.content = parser.parseFromString(theEmptyTxt, "application/xml");
}

function loadFileDocument() {
    const fileList = this.files;
    const file = fileList[0];
    console.log(file.name);
    const reader = new FileReader();
    reader.onload = function(event) {
        const contents = event.target.result;
        const parser = new DOMParser();
        theSourceDoc.content = parser.parseFromString(contents, "application/xml");
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
        <message/>
    </messagelist>
</sequencediagml>`;
    const parser = new DOMParser();
    theSourceDoc.content = parser.parseFromString(theExampleTxt, "application/xml");
    theSourceDoc.isModified = false;
    theSourceDoc.fileName = 'example.uml';
    populateUi();
}

function populateUi() {
    // theSourceDoc.content and xslSVG are application globals
    const theSvgDoc = performTransform(theSourceDoc.content, xslSVG);
    const theSvgParent=document.getElementById('svg_parent');
    theSvgParent.innerHTML = '';
    theSvgParent.appendChild(theSvgDoc.documentElement);

    const theObjectList = document.getElementById('objects');
    // clear existing objects from select before re-populating
    const existingObjects = document.getElementById('existingObjectGroup');
    if (existingObjects != null) {
      theObjectList.removeChild(existingObjects);
    }
    let optGroup = document.createElement('optgroup');
    optGroup.setAttribute('label', 'Edit or Delete');
    optGroup.setAttribute('id', 'existingObjectGroup');
    const objectNodes = theSourceDoc.content.getElementsByTagName("object");
    if (objectNodes.length) {
      for (i = 0; i <objectNodes.length; i++) {
        const option = document.createElement("option");
        option.innerHTML = (i + 1).toString() + ". " + objectNodes[i].textContent;
        option.value = i;
        optGroup.appendChild(option);
      }
      theObjectList.appendChild(optGroup);
      theObjectList.size = objectNodes.length + 3;
    }
    //const s = new XMLSerializer();
    //const str = s.serializeToString(theSourceDoc.content);
    //console.log(str);
}

function performTransform(myDoc, myTransform) {
    // Create an instance of the XSLTProcessor object
    const xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(myTransform);
    return xsltProcessor.transformToDocument(myDoc);
}

function saveUmlDocument() {
    if (theSourceDoc.content != null) {
      const s = new XMLSerializer();
      const content = s.serializeToString(theSourceDoc.content);
      //console.log(content);
      saveDocument(content);
    }
}

function saveSvgDocument() {
    if (theSourceDoc.content != null) {
      const theSvgDoc = performTransform(theSourceDoc.content, xslSVG);
      const s = new XMLSerializer();
      const content = s.serializeToString(theSourceDoc.content);
      saveDocument(content);
    }
}

function saveDocument(content) {
    // Create element with <a> tag
    const link = document.createElement("a");
    // Create a blob object with the file content which you want to add to the file
    const file = new Blob([content], { type: 'text/plain' });
    // Add file content in the object URL
    link.href = URL.createObjectURL(file);
    // Add file name
    link.download = theSourceDoc.fileName;
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
}

function populateObjectDialog(objectIdx) {
  const objectData = theSourceDoc.content.getElementsByTagName("object")[objectIdx];
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
    actBarTableBody.insertAdjacentHTML('beforeend', '<tr id="' + barRowId +'" class="barRow"><td>' + barData[i].getAttribute('begin_t') + '</td><td>' + barData[i].getAttribute('end_t') + '</td><td><button id ="'+ delBtnId + '" class="delBar" value="' + i + '">-</button></td></tr>');
    document.getElementById(delBtnId).addEventListener("click", removeActivityBar, false);
  }
  document.getElementById('bbar').value = '';
  document.getElementById('ebar').value = '';
  document.getElementById('deleteObjectDialogBtn').removeAttribute('hidden');
}

function hideObjectDialog() {
  document.getElementById('objectDialog').style.visibility = 'hidden';
}

function showMessageDialog() {
  document.getElementById('messageDialog').style.visibility = 'visible';
}

function hideMessageDialog() {
  document.getElementById('messageDialog').style.visibility = 'hidden';
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
    document.getElementById(delBtnId).addEventListener("click", removeActivityBar, false);
    sbar.value = "";
    ebar.value = "";
  }
}

function removeActivityBar(event) {
    const barId = 'barRow_' + event.target.value;
    document.getElementById(barId).remove();
}

function toggleResponseVisibility(event) {
  if(event.currentTarget.value == "synchronous")
  {
    document.getElementById('syncResponse').style.display = "inline-block";
  } else {
    document.getElementById('syncResponse').style.display = "none";
  }
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
  const objectList = theSourceDoc.content.getElementsByTagName("objectlist")[0];
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
}

function okObject() {
  updateObject();
  hideObjectDialog();
}

function deleteObject () {
  const objectIdx = document.getElementById('objectIdx');
  const objectList = theSourceDoc.content.getElementsByTagName('objectlist')[0];
  const object2BRemoved = objectList.getElementsByTagName('object')[objectIdx.value];
  objectList.removeChild(object2BRemoved);
  theSourceDoc.isModified = true;
  populateUi();
  hideObjectDialog();
}

function updateMaxT(event) {
  console.log(event.target.value);
  const max_t = theSourceDoc.content.getElementsByTagName('max_t')[0]
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
  const sorted = xsltProcessor.transformToDocument(doc2BSorted);
  const s = new XMLSerializer();
  const str = s.serializeToString(sorted);
  console.log(str);
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
    //const openMessageDialog = document.getElementById('openMessageDialog');
    //openMessageDialog.addEventListener('click', showMessageDialog);
    const hideMsgDialog = document.getElementById('cancelMessageDialogBtn');
    hideMsgDialog.addEventListener('click', hideMessageDialog);
    const messageType = document.getElementById('messageType');
    messageType.addEventListener('change', toggleResponseVisibility);

    window.addEventListener("beforeunload", check4Changes);

    loadEmptyDocument();
  }
};
