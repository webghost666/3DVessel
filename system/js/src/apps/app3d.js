var scene = require('../core/vessels-3d.js');
var __s__ = require('../utils/js-helpers.js');
var __d__ = require('../utils/dom-utilities.js');
var i18labels = require('../core/i18labels.js');

var node = document.getElementById("app-3d"),
    titleNode = document.getElementById("titleH1"),
    bayNode = document.getElementById("titleBay"),
    infoNode = document.getElementById("info-window"),

    queryParams = __s__.getQueryParams(),
    app3d, data,
    controlsControl;

controlsControl = {
    dropFilter: null,
    dropFilterValue: null,
    showWireframes: null,
    currentlyHidden: [],
    latestFilter: "",
    dropBays: null,
    dropBaysDictionary: {},
    dropAddHouse: null,
    openBayInfo: null,
    closeBayInfo: null,
    bayInfo: null,
    bayInfoTable: null,
    baySelected: "",
    shipHouseSpace: 20.5,
    isExpanded: false,
    prevnextCont: null,
    prevnextNum: 1,
    numContsByBlock: null,
    hatchDecksVisible: true,

    init: function (){
        let ctrlColors = document.getElementById("dropColors"),
            ctrlFilter = document.getElementById("dropFilter"),
            j, opt, me = controlsControl,
            filters = app3d.data.filters;

        me.dropFilterValue = document.getElementById("dropFilterValue"); 
        me.showWireframes = document.getElementById("showWireframesFiltered");
        me.expandViewBtn = document.getElementById("expandView");
        me.prevnextCont = document.getElementById("prevnext-container");
        me.dropFilter = ctrlFilter;
        me.checkboxHatchCovers = document.getElementById("view-hcs");
        me.navBaysNext = document.getElementById("bay-next");
        me.navBaysPrev = document.getElementById("bay-prev");
        
        opt = document.createElement("option");
        opt.value = ""; opt.innerHTML = "None";
        ctrlFilter.appendChild(opt);
        
        for(j in filters) {                
            opt = document.createElement("option");
            opt.value = j; opt.innerHTML = filters[j].name;
            ctrlFilter.appendChild(opt);
            
            opt = document.createElement("option");
            opt.value = j; opt.innerHTML = filters[j].name;
            ctrlColors.appendChild(opt);
        }
        ctrlColors.value = "i";
        
        __d__.addEventLnr(ctrlFilter, "change", me.prepareFilter);
        __d__.addEventLnr(me.dropFilterValue, "change", me.processFilterValue);
        __d__.addEventLnr(ctrlColors, "change", me.colorize);
        __d__.addEventLnr(me.showWireframes, "change", me.listenWireframeDisplay);
        __d__.addEventLnr(window, "keydown", me.checkKeyPressed);
        __d__.addEventLnr(me.expandViewBtn, "change", me.expandView);
        __d__.addEventLnr(me.checkboxHatchCovers, "change", me.toggleHatchCovers);

        __d__.addEventLnr(me.navBaysNext, "click", function() { __s__.callOnCondition(me.isExpanded, me.expandViewNext, me.baysControlNext)} );
        __d__.addEventLnr(me.navBaysPrev, "click", function() { __s__.callOnCondition(me.isExpanded, me.expandViewPrev, me.baysControlPrev)} );

        me.addBaysControl();
        me.addHouseControl();
        me.pauseControls(false);

    },

    addBaysControl: function () {
        var key, j, lenJ, bayGroup,
            dropBays = document.getElementById("dropBays"),
            bays = [], oddB, prevOddExists, nextOddExists, oneOddExists,
            me = controlsControl, iBay,
            g3Bays = app3d.renderer3d.g3Bays,
            dataStructured = app3d.data.dataStructured,
            lis = ["<option value=''>All bays</option>"];
        
        function changeBay(ev) {
            var v = ev.target.value;
            me.isolateBay(v);
        }            
            
        for (key in g3Bays) {
            bayGroup = g3Bays[key];
            if (bayGroup.children.length > 0)
                bays.push(bayGroup.name.replace("b", ""));
        }

        bays = bays.sort(__s__.sortNumeric);
        for (j = 0, lenJ = bays.length; j < lenJ; j +=1){
            iBay = Number(bays[j]);
            oddB = iBay % 2 === 1;
            if(oddB) {
                if (dataStructured[bays[j]].n) {
                    lis.push("<option value='" + bays[j] + "'>" + bays[j] + "</option>");
                    me.dropBaysDictionary[bays[j]] = bays[j];
                }
            }
            else {
                prevOddExists = (j+1) < lenJ && Number(bays[j+1]) === (iBay + 1);
                if(!prevOddExists && !me.dropBaysDictionary[__s__.pad(iBay - 1, 3)]) {
                    lis.push("<option value='" + __s__.pad(iBay, 3) + "'>" + __s__.pad(iBay - 1, 3) + "</option>"); 
                    me.dropBaysDictionary[__s__.pad(iBay - 1, 3)] = __s__.pad(iBay, 3);
                }
            }
        }
                    
        dropBays.innerHTML = lis.join("");
        me.dropBays = dropBays;
        __d__.addEventLnr(me.dropBays, "change", changeBay);
        
        me.openBayInfo = document.getElementById("open-panel");
        me.closeBayInfo = document.getElementById("close-panel");
        me.bayInfo = document.getElementById("bay-panel");
        me.bayInfoTable = document.getElementById("bay-table-container");
        
        __d__.addEventLnr(me.openBayInfo, "click", me.showBayInfo);
        __d__.addEventLnr(me.closeBayInfo, "click", me.showBayInfo);
        me.openBayInfo.style.left = "-300px";
                
    },

    baysControlNext() {
        let me = controlsControl,
            c = me.dropBays.selectedIndex + 1,
            maxIndex = me.dropBays.length;
        if (c < maxIndex) {
            me.dropBays.selectedIndex = c;
            me.isolateBay(me.dropBays.value);
        }
        me.navBaysPrev.className = "prevnext bay-prev noselect " + (c > 2 ? "active" : "");
        me.navBaysNext.className = "prevnext bay-next noselect " + (c + 1 >= maxIndex ? "" : "active");        
    },

    baysControlPrev() {
        let me = controlsControl,
            c = me.dropBays.selectedIndex - 1,
            maxIndex = me.dropBays.length;
        if (c >= 0) {
            me.dropBays.selectedIndex = c;
            me.isolateBay(me.dropBays.value);
        } 
        me.navBaysPrev.className = "prevnext bay-prev noselect " + (c > 2 ? "active" : "");
        me.navBaysNext.className = "prevnext bay-next noselect " + (c + 1 >= maxIndex ? "" : "active");        
    },

    addHouseControl: function () {
        var me = controlsControl,
            dropAddHouse = document.getElementById("dropAddHouse"),
            dataStructured = app3d.data.dataStructured,
            key, bays, j, lenJ, lis = ["<option value=''>No house</option>"]; 
        

        bays = __s__.objKeysToArray(me.dropBaysDictionary);
        bays = bays.sort(__s__.sortNumeric);
        for(j = bays.length - 1; j >= 0; j -= 1) {
            key = bays[j];
            if (dataStructured[key].maxD > 20) {
                lis.push("<option value='" + me.dropBaysDictionary[key] + "'>before " + key +"</option>");
            }
        }

        dropAddHouse.innerHTML = lis.join("");
        __d__.addEventLnr(dropAddHouse, "change", me.moveShipHouseLnr);
        me.dropAddHouse = dropAddHouse;
    },

    prepareFilter: function (e) {
        var v = e.target.value, key, currentFilter, 
            opts = [ "<option value=''>No filter</option>"],
            me = controlsControl,
            filters = app3d.data.filters;
        
        if(!v) {
            me.pauseControls(true);
            me.showHiddenMeshes();
            me.pauseControls(false);
            me.dropFilterValue.value = "";
            me.dropFilterValue.innerHTML = opts.join("");
            me.dropFilterValue.setAttribute("disabled", "disabled");
            return;
        }
        
        if (me.latestFilter !== v) {
            me.pauseControls(true);
            me.showHiddenMeshes();
            me.pauseControls(false);
        }
        
        me.latestFilter = v;
        me.dropFilterValue.removeAttribute("disabled");
        me.dropFilterValue.innerHTML = "";
        currentFilter = filters[v];
        
        if (currentFilter.tf) {
            opts.push("<option value='1'>yes</option>"); 
            opts.push("<option value='0'>no</option>");
        } else {
            for(key in currentFilter.obs) {
                opts.push("<option value='" + key + "'>" + key + "</option>");
            }
        }
        me.dropFilterValue.innerHTML = opts.join("");
    },

    processFilterValue: function (e) {
        var v = e.target.value, 
            me = controlsControl, 
            filter = me.dropFilter, j, lenJ, key,
            showWireframes = me.showWireframes.checked,
            filters = app3d.data.filters,
            allContainerMeshesObj = app3d.data.allContainerMeshesObj,
            currentlyHidden = [], newFilterIndexes, mesh;
        
        me.pauseControls(true);
        me.showHiddenMeshes();
        if (v === "") { me.pauseControls(false); return; }
                    
        newFilterIndexes = filters[ me.dropFilter.value ].obs;
        for(key in newFilterIndexes) {
        if (me.dropFilterValue.value === key) { continue; }
            for (j = 0, lenJ = newFilterIndexes[key].indexes.length; j < lenJ; j += 1) {
                mesh = allContainerMeshesObj[ newFilterIndexes[key].indexes[j].c ];
                if (showWireframes) {
                    mesh.isBasic = true;
                    mesh.material = app3d.renderer3d.basicMaterial;
                } else {
                    mesh.visible = false;
                }
                currentlyHidden.push(newFilterIndexes[key].indexes[j].c);
            }
        }
        
        me.currentlyHidden = currentlyHidden;
        me.pauseControls(false);
        
    },

    processWireframeDisplay: function (toWireframes) {
        var me = controlsControl,
            currentlyHidden = me.currentlyHidden,
            j, mesh,
            allContainerMeshesObj = app3d.data.allContainerMeshesObj,
            lenJ = currentlyHidden.length;
            
        if (lenJ) {
            for (j = 0; j < lenJ; j += 1) {
                mesh = allContainerMeshesObj[ currentlyHidden[j] ];
                if (toWireframes) {
                    mesh.isBasic = true;
                    mesh.material = app3d.renderer3d.basicMaterial;
                    mesh.visible = true;
                } else {
                    mesh.visible = false;
                }
            }
        }
    },

    listenWireframeDisplay: function (ev) {
        var v = ev.target.checked, 
            me = controlsControl;
            
        me.pauseControls(true);
        me.processWireframeDisplay(v);
        me.pauseControls(false);
    },

    showHiddenMeshes: function () {
        var currentlyHidden = controlsControl.currentlyHidden,
            j, mesh, lenJ = currentlyHidden.length,
            allContainerMeshesObj = app3d.data.allContainerMeshesObj;
            
        if (lenJ > 0) {
            for (j = 0; j < lenJ; j += 1) {
                mesh = allContainerMeshesObj[ currentlyHidden[j] ];
                if (mesh.isBasic) {
                    mesh.material = app3d.renderer3d.allMaterials[ mesh.materialPos ];
                    mesh.isBasic = false;
                }
                mesh.visible = true;
            }
        }
        controlsControl.currentlyHidden = []               
    },

    pauseControls: function( disable ) {
        var me = controlsControl, prevAttr;
            
        if (disable) {
            prevAttr = me.dropFilterValue.getAttribute("disabled");
            me.dropFilter.setAttribute("disabled", "disabled");
            me.dropFilterValue.setAttribute("disabled", "disabled");
            me.dropFilterValue.setAttribute("prevAttr", prevAttr);
            me.showWireframes.setAttribute("disabled", "disabled");
            me.dropBays.setAttribute("disabled", "disabled");
            me.dropAddHouse.setAttribute("disabled", "disabled");
            return;
        }
        //else
        prevAttr = me.dropFilterValue.getAttribute("prevAttr");
        me.dropFilter.removeAttribute("disabled");
        if(prevAttr !== "disabled") { me.dropFilterValue.removeAttribute("disabled"); }
        me.showWireframes.removeAttribute("disabled");

        if (!me.isExpanded) {
            me.dropBays.removeAttribute("disabled");
            me.dropAddHouse.removeAttribute("disabled");
        }

    },

    colorize: function (e) {
        var v = e.target.value, j, lenJ,
            mesh, obj,
            allContainerMeshesObj = app3d.data.allContainerMeshesObj,
            filters = app3d.data.filters,
            data = app3d.data.data;
      
        controlsControl.showColorsTable(v);
        
        for (j = 0, lenJ = data.info.contsL; j < lenJ; j += 1) {
            obj = data.conts[j];
            mesh = allContainerMeshesObj[obj.cDash];
            mesh.materialPos = filters[v].obs[obj[v]].materialPos;
            if(!mesh.isBasic) { mesh.material = app3d.renderer3d.allMaterials[ mesh.materialPos ]; }
        }
    },

    isolateBay: function(sBay, force = false) {
        
        var me = controlsControl,
            iBay = Number(sBay), sepZ = 40, topY = 500, newZ, 
            dataStructured = app3d.data.dataStructured,
            filters = app3d.data.filters,
            g3Bays = app3d.renderer3d.g3Bays,
            shipHouse = app3d.renderer3d.shipHouse;
        
        function generateTable(bayToAnimate) {
            var keyCell, keyTier, iBaseBay, cell, ob, iEvenBay,
                tableBase, tableExtraBase, cells, tiers, maxCell, tiersAcc = {},
                sBay, sExtraBay, isEven = false,
                j, lenJ, k, dat, htmlArr,
                htmlTable, htmlRow, htmlCell;
                
            function createThTable() {
                var htmlRow = document.createElement("tr");
                for (k = 0; k <= maxCell; k += 1) {
                    dat = __s__.pad(k, 2);
                    htmlCell = document.createElement("th");
                    htmlCell.innerHTML = dat;
                    k % 2 === 0 ?
                            htmlRow.appendChild(htmlCell) :
                            htmlRow.insertBefore(htmlCell, htmlRow.firstChild);
                }
                htmlRow.insertBefore(document.createElement("th"), htmlRow.firstChild);
                htmlRow.appendChild(document.createElement("th"));
                return htmlRow;
            }
            
            /*
            iBaseBay = (bayToAnimate - 1) % 4 === 0 ? bayToAnimate : bayToAnimate - 2;*/
            iBaseBay = bayToAnimate;
            if (iBaseBay % 2 === 0) { isEven = true; iBaseBay -= 1;}

            iEvenBay = bayToAnimate - 1;
            if (!g3Bays["b" + __s__.pad(iEvenBay, 3)]) { iEvenBay += 2; }
            if (!g3Bays["b" + __s__.pad(iEvenBay, 3)]) { iEvenBay = 0; }
            
            sBay = __s__.pad(iBaseBay, 3);
            sExtraBay = __s__.pad(bayToAnimate, 3);
            tableBase = JSON.parse(JSON.stringify(dataStructured[sBay])); //deep copy
            
            if (iBaseBay !== bayToAnimate) { //Mid bay like 3, 7, 11,...
                tableExtraBase = JSON.parse(JSON.stringify(dataStructured[sExtraBay])); //deep copy
                //Remove
                for(keyCell in tableBase.cells) {
                    cell = tableBase.cells[keyCell];
                    for(keyTier in cell.tiers) {
                        ob = cell.tiers[keyTier];
                        if (ob.p.indexOf(sBay) === 0) {
                            tableBase.cells[keyCell].tiers[keyTier] = null;
                        }
                    }
                }
                //Replace 
                for(keyCell in tableExtraBase.cells) {
                    cell = tableExtraBase.cells[keyCell];
                    for(keyTier in cell.tiers) {
                        ob = cell.tiers[keyTier];
                        if (ob.p.indexOf(sExtraBay) === 0) {
                            if(!tableBase.cells[keyCell]) { tableBase.cells[keyCell] = { tiers: {} }; }
                            tableBase.cells[keyCell].tiers[keyTier] = ob;
                        }
                    }
                }                    
            }
            
            //Find all tiers
            for(keyCell in tableBase.cells) {
                for(keyTier in tableBase.cells[keyCell].tiers) {
                    if (!tiersAcc[keyTier]) { tiersAcc[keyTier] = 1; }
                }
            }                

            cells = __s__.objKeysToArray(tableBase.cells, true);
            tiers = __s__.objKeysToArray(tiersAcc, true);
            maxCell = Number(cells[cells.length - 1]);
            
            htmlTable = document.createElement("table");
            htmlTable.setAttribute("align", "center");
            htmlRow = createThTable();
            htmlTable.appendChild(htmlRow);
            
            for (j = tiers.length - 1; j >= 0; j -= 1) {
                htmlRow = document.createElement("tr");
                htmlRow.setAttribute("data-tier", tiers[j]);
                htmlTable.appendChild(htmlRow);
                
                for (k = 0; k <= maxCell; k += 1) {
                    dat = __s__.pad(k, 2);
                    htmlCell = document.createElement("td");
                    htmlCell.id = "td_" + dat + "_" + tiers[j];
                    if(tableBase.cells[dat] && tableBase.cells[dat].tiers[tiers[j]]) {
                        ob = tableBase.cells[dat].tiers[tiers[j]];
                        htmlArr = [];
                        htmlArr.push(ob.s ? "F <br />" : "e <br />");
                        htmlArr.push("<span class='dest' style='background:" + filters.d.obs[ob.d].color + "'>" + ob.d + "</span><br />");
                        htmlArr.push("<span class='haz " + (ob.w ? "isHaz" : "") + "'>" + (ob.w ? "HAZARDOUS" : "") + "</span>");
                        htmlArr.push("<span class='cont'>" + ob.c.substr(0, 4) + "<br />" + ob.c.substr(4) + "</span> ");
                        htmlArr.push("<span class='opr' style='background:" + filters.o.obs[ob.o].color + "'>" + ob.o + "</span><br />");
                        htmlArr.push("<span class='iso'>" + ob.i + "</span><br />");
                        htmlArr.push("<span class='mt'>" + ob.m + "MT</span> ");
                        htmlCell.innerHTML = htmlArr.join("");
                    } else {
                        htmlCell.innerHTML = "&nbsp;";
                        htmlCell.className = "empty";
                    }
                    k % 2 === 0 ?
                        htmlRow.appendChild(htmlCell) :
                        htmlRow.insertBefore(htmlCell, htmlRow.firstChild);
                }
                
                htmlCell = document.createElement("td");
                htmlCell.innerHTML = tiers[j];
                htmlCell.className = "th";
                htmlRow.insertBefore(htmlCell, htmlRow.firstChild);    
                                
                htmlCell = document.createElement("td");
                htmlCell.innerHTML = tiers[j];
                htmlCell.className = "th";
                htmlRow.appendChild(htmlCell);                   
            }
            
            htmlRow = createThTable();
            htmlTable.appendChild(htmlRow);
            
            me.bayInfoTable.innerHTML = "";
            me.bayInfoTable.appendChild(htmlTable);                
        }
        
        function animateBays(bayToAnimate, timing, addC, delC, bayY) {
            var key, i, bayM, bayMeven, iEvenBay, addToShipHouse,
                bayGroup;
            
            iEvenBay = bayToAnimate - 1;
            if (!g3Bays["b" + __s__.pad(iEvenBay, 3)]) { iEvenBay += 2; }
                
            for (key in g3Bays) {
                bayGroup = g3Bays[key];
                i = Number(bayGroup.name.replace("b", ""));
                if (i !== bayToAnimate && i !== iEvenBay) {
                    if(i < bayToAnimate) {
                        TweenLite.to(bayGroup.position, timing, {z: bayGroup.originalZ - addC, delay: delC, ease: Power2.easeInOut})
                    } else {
                        TweenLite.to(bayGroup.position, timing, {z: bayGroup.originalZ + addC, delay: delC, ease: Power2.easeInOut})
                    }
                }
            }
            
            if (app3d.renderer3d.shipHouse.mesh.visible) {
                addToShipHouse = bayToAnimate < shipHouse.currPosBay ? addC : -addC;
                TweenLite.to(shipHouse.mesh.position, timing, 
                    {z: shipHouse.currPosZ + addToShipHouse, delay: delC, ease: Power2.easeInOut});
            }
            
            bayM = g3Bays["b" + __s__.pad(bayToAnimate, 3)];
            bayMeven = g3Bays["b" + __s__.pad(iEvenBay, 3)];
            if(bayM) {
                TweenLite.to(bayM.position, timing, {y: bayY, delay:0.5, ease: Power2.easeInOut});
                //bayM.labels.visible = !!bayY; 
            }
            if(bayMeven) {
                TweenLite.to(bayMeven.position, timing, {y: bayY, delay:0.5, ease: Power2.easeInOut});
            }
            
            return bayM.originalZ;
        }
        
        function separateBay(sBay) {
            var key, i, 
                bayGroup, camZ, camY, camX, cY, topPos, baySelected, bayY, delayUp,
                me = controlsControl, openBaypanelButtonZ,
                addC, opened,
                options = app3d.options,
                controls = app3d.renderer3d.controls,
                camPos = app3d.renderer3d.camera.position;
                
            me.pauseControls(true);
            me.expandViewBtn.setAttribute("disabled", "disabled");
            opened = me.baySelected !== "";
            if(opened) {
                //cerramos
                animateBays(Number(me.baySelected), 0.35, 0, 0, 0);
                //abrimos
                if (iBay > 0) {
                    newZ = animateBays(iBay, 0.4, sepZ, .75, topY);
                }
            } else {
                //abrimos uno nuevo
                newZ = animateBays(iBay, 1, sepZ, 0, topY);
            }
            
            if(sBay !== "") {
                me.baySelected = sBay;
                camZ = newZ - 240;
                camY = topY;
                camX = 0;
                cY = topY - 10;
                delayUp = 0.5;
                controls.dampingFactor = options.dampingFactorIn;
                openBaypanelButtonZ = 30;
                newZ += 11;
                me.checkboxHatchCovers.setAttribute("disabled", "disabled");
                me.expandViewBtn.setAttribute("disabled", "disabled");
                app3d._bayNode.innerHTML = "<small>bay</small> " + iBay;

                me.prevnextCont.style.display = "block";
                let cbb = me.dropBays.selectedIndex, maxIndex = me.dropBays.length;
                me.navBaysPrev.className = "prevnext bay-prev noselect " + (cbb > 1 ? "active" : "");
                me.navBaysNext.className = "prevnext bay-next noselect " + (cbb + 1 === maxIndex ? "" : "active");

            } else {
                me.baySelected = "";
                camZ = me.initialCameraPosition.z;
                camY = me.initialCameraPosition.y;
                camX = me.initialCameraPosition.x;
                cY = 0;
                newZ = me.initialCameraPosition.targetZ;
                delayUp = 0;
                controls.dampingFactor = options.dampingFactorOut;
                openBaypanelButtonZ = -300;
                me.checkboxHatchCovers.removeAttribute("disabled");
                me.prevnextCont.style.display = "none";
            }                     
            TweenLite.to(camPos, 1, {x: camX, y: camY, z:camZ, delay:delayUp, ease: Power2.easeInOut});
            TweenLite.to(controls.target, 2.0, { y: cY, x: 0, z: newZ, ease: Power2.easeInOut });
            TweenLite.to(me.openBayInfo, 1.0, { left: openBaypanelButtonZ, delay:delayUp * 4,  ease: Power2.easeInOut });
            setTimeout(function() {
                if (me.baySelected === "") {  me.expandViewBtn.removeAttribute("disabled"); }
                me.pauseControls(false);
            }, 2500);
        }
        
        
        separateBay(!sBay ? "" : sBay);
        if(!!sBay) {
            me.dropAddHouse.setAttribute("disabled", "disabled"); 
            generateTable(iBay);
        } else {
            me.dropAddHouse.removeAttribute("disabled"); 
        }
        

    },

    showBayInfo: function(ev) {
        
        var show = ev.target.id === "open-panel",
            me = controlsControl;
            
        if (show) {
            me.bayInfo.style.display = "block";
            app3d.pauseRendering();
        } else {
            me.bayInfo.style.display = "none";
            app3d.resumeRendering();
        }
    },

    tryToLaunchBay: function(sBay) {
        var me = controlsControl,
            dataStructured = app3d.data.dataStructured,
            iBay, tryBay;
        
        if (!sBay || sBay === "n") { return; } 
        
        if(dataStructured[sBay]) {
            me.dropBays.value = me.dropBaysDictionary[sBay];
            me.isolateBay(sBay);
            return;
        }
        
        iBay = Number(sBay);
        tryBay = __s__.pad(iBay + 1, 3);
        
        if(dataStructured[tryBay]) {
            me.dropBays.value = tryBay;
            me.isolateBay(tryBay); 
        }
            
    },

    moveShipHouseLnr: function (ev) {
        var v = ev.target.value;
        controlsControl.moveShipHouse(v);
    },

    moveShipHouse: function (v) {
        var key, bayGroup, i,
            me = controlsControl,
            bays, j, lenJ,
            shipHouse = app3d.renderer3d.shipHouse,
            g3Bays = app3d.renderer3d.g3Bays,
            hatchCovers = app3d.renderer3d.hatchCovers,
            shipHouseSpace = me.shipHouseSpace;
        
        app3d.pauseRendering();

        if(shipHouse.currPosBay > 0) {
            for (key in g3Bays) {
                bayGroup = g3Bays[key];
                i = Number(bayGroup.name.replace("b", ""));
                if(i < shipHouse.currPosBay) {
                    bayGroup.position.z += shipHouseSpace;
                    bayGroup.originalZ += shipHouseSpace;

                    if (hatchCovers[key]) {
                        hatchCovers[key].position.z += shipHouseSpace;
                        hatchCovers[key].originalZ += shipHouseSpace;
                    }
                }
            }
        }
        
        if(v === "") {
            shipHouse.mesh.visible = false;
            app3d.resumeRendering();
            return;
        }
        
        shipHouse.currPosBay = Number(v);

        for (key in g3Bays) {
            bayGroup = g3Bays[key];
            i = Number(bayGroup.name.replace("b", ""));
            if(i < shipHouse.currPosBay) {
                bayGroup.position.z -= shipHouseSpace;
                bayGroup.originalZ -= shipHouseSpace;

                if (hatchCovers[key]) {
                    hatchCovers[key].position.z -= shipHouseSpace;
                    hatchCovers[key].originalZ -= shipHouseSpace;
                }
                
            }
        }            
                    
        shipHouse.mesh.visible = true;
        shipHouse.mesh.position.z = g3Bays["b" + v].position.z - shipHouseSpace - 0.5;
        shipHouse.currPosZ = Number(shipHouse.mesh.position.z);

        app3d.resumeRendering();
        
    },

    checkKeyPressed: function(e) {
        let me = controlsControl;

        switch(e.keyCode) {
            case 27:
                if (me.isExpanded){ return; }

                if (me.baySelected !== "") {
                    me.dropBays.value = "";
                    me.bayInfo.style.display = "none";
                    app3d.renderer3d._isRendering = true;
                    me.isolateBay("");
                } else {
                    TweenLite.to(app3d.renderer3d.camera.position, 1.0, 
                        { y: me.initialCameraPosition.y, 
                        x: me.initialCameraPosition.x,
                        z: me.initialCameraPosition.z,
                        ease: Power2.easeInOut
                        }
                    );
                }

                break;
        }
    },

    showColorsTable: function (attr) {
        var tableColors = document.getElementById("tableColors"),
            liColors = [], key, attr, isTf, val,
            filters = app3d.data.filters;
            
        isTf = filters[attr].tf;
        for (key in filters[attr].obs) {
            val = filters[attr].obs[key];
            if (isTf) {
                liColors.push("<li><span style='background:" + val.color + "'></span>" + (key==="1" ? "yes" : "no") + "</li>");
            } else {
                liColors.push("<li><span style='background:" + val.color + "'></span>" + key + "</li>");
            }
        }
        tableColors.innerHTML = liColors.join("");
    },

    expandView: function(ev) {
        let me = controlsControl,
            doExpand = ev.target.checked,
            iBay, g3Bay, key, j, 
            g3Bays = app3d.renderer3d.g3Bays,
            dataStructured = app3d.data.dataStructured,
            maxWidth = app3d.renderer3d.maxWidth,
            extraSep = app3d.options.extraSep,
            xAdd =  maxWidth * (9.5 + extraSep) * 1.5,
            xAccum = xAdd,
            visib = true,
            lastBay = app3d.data.lastBay;

        //Aggregates num of containers by block
        function calculateContsByBlock() {
            if (me.numContsByBlock) { return; }

            let ncbb = {}, j, key,
                numContsByBay = app3d.data.numContsByBay;

            for (j = 1; j <= lastBay + 1; j += 1) {
                key = __s__.pad(j, 3);
                g3Bay = g3Bays["b" + key];
                if (!g3Bay) { continue; }
                if (!ncbb[g3Bay.compactBlockNum]) {
                    ncbb[g3Bay.compactBlockNum] = { n: 0 };
                }

                ncbb[g3Bay.compactBlockNum].n += numContsByBay[key] || 0;           
            }

            me.numContsByBlock = ncbb;
        }            

        //Expands the bays horizontally
        function expandBays() {
            let cbbj;

            me.dropBays.setAttribute("disabled", "disabled");
            me.dropAddHouse.setAttribute("disabled", "disabled");
            
            if (me.baySelected !== "") {
                me.openBayInfo.style.left = "-300px";
            }

            for (j = 1; j <= lastBay + 1; j += 1) {
                key = __s__.pad(j, 3);
                g3Bay = g3Bays["b" + key];
                
                if (!g3Bay) { continue; }
                cbbj = me.numContsByBlock[g3Bay.compactBlockNum];

                if (g3Bay.isBlockStart && cbbj.n) {
                    xAccum -= xAdd;
                    g3Bay.labels.visible = true;
                }

                g3Bay.position.z = j & 1 && !g3Bay.isBlockStart ? 22.5 + extraSep : 0;
                g3Bay.position.x = xAccum;
                g3Bay.position.y = 0;
            }

            me.prevnextNum = 1;
            me.navBaysPrev.className = "prevnext bay-prev noselect ";
            app3d._bayNode.innerHTML = "<small>bay</small> 1";

            app3d.renderer3d.simpleDeck.visible = false;
            app3d.renderer3d.hatchDeck.visible = false;
            app3d.renderer3d.shipHouse.prevVisible = app3d.renderer3d.shipHouse.mesh.visible;
            app3d.renderer3d.shipHouse.mesh.visible = false;
            app3d.renderer3d.camera.position.set(0, /*app3d.data.aboveTiers.n * 0*/ -2, -xAdd * 0.8);
            app3d.renderer3d.controls.target.set(0, 0, 20);
            me.prevnextCont.style.display = "block";

            me._showBaysHatchCovers(me.hatchDecksVisible);
        }

        function contractBays() {
            for (key in g3Bays) {
                g3Bay = g3Bays[key];
                g3Bay.position.z = g3Bay.originalZ;
                g3Bay.position.x = 0;
                g3Bay.position.y = 0;
                if (g3Bay.labels) { g3Bay.labels.visible = false;}
            }  

            let ic = controlsControl.initialCameraPosition;
            app3d.renderer3d.setCameraPosition(ic.x, ic.y, ic.z);
            app3d.renderer3d.controls.target.x = 0;
            app3d.renderer3d.controls.target.y = 0;
            app3d.renderer3d.controls.target.z = ic.targetZ;

            app3d.renderer3d.simpleDeck.visible = true;
            app3d.renderer3d.hatchDeck.visible = me.hatchDecksVisible;
            app3d.renderer3d.shipHouse.mesh.visible = app3d.renderer3d.shipHouse.prevVisible;
            
            me.prevnextCont.style.display = "none";
            me.pauseControls(false);
            
        }

        calculateContsByBlock();
        me.isExpanded = doExpand;

        app3d.pauseRendering();
        (doExpand ? expandBays : contractBays)();
        app3d.resumeRendering(); 
    },

    expandViewNext () { controlsControl.expandViewNextPrev(true); },
    expandViewPrev () { controlsControl.expandViewNextPrev(false); },

    expandViewNextPrev (next) {
        let me = controlsControl,
            timing = 0.5,
            key, gBay, newBlockNum,
            g3Bays = app3d.renderer3d.g3Bays,
            lastBay = app3d.data.lastBay;

        const myXAnd = (a,b) => a ? b : !b;        

        function showBays() {
            let g3Bay, j;

            newBlockNum = me.prevnextNum;
            do {
                newBlockNum = newBlockNum + (next ? 1 : -1);
                if (newBlockNum <= 0 || newBlockNum > app3d.renderer3d.maxCompactBlockNums) { return null; }
            } while (me.numContsByBlock[newBlockNum].n <= 0);

            me.navBaysPrev.className = "prevnext bay-prev noselect " + (newBlockNum > 1 ? "active" : "");
            me.navBaysNext.className = "prevnext bay-next noselect " + (newBlockNum === app3d.renderer3d.maxCompactBlockNums ? "" : "active");

            for (j = 1; j <= lastBay + 1; j += 1) {
                key = __s__.pad(j, 3);
                g3Bay = g3Bays["b" + key];

                if (!g3Bay) { continue; } 
                if (g3Bay.compactBlockNum === newBlockNum) {
                    if (me.numContsByBlock[g3Bay.compactBlockNum].n) { 
                        return g3Bay;
                    }
                }

            }
            return null;
        }

        gBay = showBays();
        if (!gBay) { return; }

        TweenLite.to(app3d.renderer3d.camera.position, timing, {x: gBay.position.x, ease: Power2.easeInOut});
        TweenLite.to(app3d.renderer3d.controls.target, timing, {x: gBay.position.x, ease: Power2.easeInOut});
        app3d._bayNode.innerHTML = "<small>bay</small> " + gBay.iBay;

        me.prevnextNum = newBlockNum;        
    },

    toggleHatchCovers (ev) {
        let me = controlsControl,
            v = ev.target.checked,
            hcs = app3d.renderer3d.hatchDeck;

        me.hatchDecksVisible = v;

        if (!me.isExpanded) {
            hcs.visible = v;
            me._showBaysHatchCovers(false);
        } else {
            hcs.visible = false;
            me._showBaysHatchCovers(v);
        }
    },

    _showBaysHatchCovers(s) {
        let key, g3Bay,
            g3Bays = app3d.renderer3d.g3Bays;
            
        for (key in g3Bays) {
            g3Bay = g3Bays[key];
            if (!g3Bay.isBlockStart) { continue; }
            if (g3Bay.hatchC) {
                g3Bay.hatchC.visible = s;
            }
        }
    }

    
}; //controlsControl 


/* Main program 3D ------------------------------------------------  */

//Initialize
app3d = new scene.VesselsApp3D(node, titleNode, infoNode, bayNode);
//LoadUrl
app3d.loadUrl(queryParams.json, i18labels.LOADING_DATA)
    .then(
        function(loadedData) {
            let renderer3d = app3d.renderer3d,
                modelsFactory = app3d.modelsFactory,
                maxDepth, maxDepthHalf;

            //Title
            app3d.updateHtmlTitle(loadedData.VesselName, loadedData.PlaceOfDeparture, loadedData.VoyageNumber);
            
            //Process data
            app3d.data = app3d.loadData(loadedData);

            //Generate 3D objects
            //Pass 1. Map to bays & models
            for(let j = 0, lenJ = app3d.data.data.info.contsL; j < lenJ; j += 1) {
                let obj = app3d.data.data.conts[j];
                renderer3d.createBay(obj.bay);
                modelsFactory.addIsoModel(obj);
            }
            //Pass 2.
            modelsFactory.extendSpecs(app3d.data.filters);
            renderer3d.createBaseModels(modelsFactory.isoModels);
            renderer3d.create3dContainersFromData(app3d.data);
            if (app3d.data.data.conts[0]) { renderer3d.putInfoWindow(app3d.data.data.conts[0]); }

            //Init controls of this app
            controlsControl.init();
            controlsControl.showColorsTable("i");
            controlsControl.tryToLaunchBay(app3d.initialBay);

            //Reposition camera
            maxDepth = renderer3d.maxDepth;
            maxDepthHalf = Math.round(maxDepth / 2);
            controlsControl.initialCameraPosition = renderer3d.setCameraPosition(-Math.round(maxDepth * 0.75), 350, Math.round(maxDepth * 0.5));

            renderer3d.controls.maxDistance = maxDepth * 1.5;
            renderer3d.controls.target.z = maxDepthHalf;
            controlsControl.initialCameraPosition.targetZ = maxDepthHalf;

        }, function(msg) {
            app3d._node.loadingDiv.setMessage(msg, true);
            app3d._node.loadingDiv.updateLoader(0.0, 1.0);
        })/*
        .catch(function(msg) {
            app3d._node.loadingDiv.setMessage(msg, true);
            app3d._node.loadingDiv.updateLoader(0.0, 1.0);
        })*/;

window.appVessels3D = app3d;
