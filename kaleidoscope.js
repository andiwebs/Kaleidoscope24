/*
	Kaleidoscope24
	Copyright (C) 2023 Andreas Mauer
	andreas - mauer <a> web.de
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU Affero General Public License for more details.
	You should have received a copy of the GNU Affero General Public License
	along with this program. If not, see <http://www.gnu.org/licenses/>.
*/
var txHistIns=1,UndoRedoPos=0,namesUndoRedo=[],ownDesigns=[],ownDesisel=[],ownDesiseAct=0,imCanvasGif=[],setMouseSelColor=false,xyHandle=[],newCanvasCopy,setsShapesSel=0,transpsets=[0,0,0,-0.5,0],saveasjpg=false,canvasWidthHeight=[700,700],rotateTilingSet=0,sectorSlider2set=12,scalePieTiling =1.42,setKisrhombille=1,copiesKisrhombille=0,currentTiling,currentTilingNum=4,currentFilter='none',vignetteset=0,canvasVignette=0,theCutRelxy=[],thClickTx=[1024,1024,'aaa.jpg',777,0],fontplus=['Lobster','Pacifico','Caveat','Jura'],meinbgcolor='transparent',setmouseov=1,supportsPassive=false,liactives=0,imgInSvgWidth,imgInSvgHeight,theCutRel={},shapeScaleInSrcImg=0.4,canvas=$('kaleidoCanvas'),context=canvas.getContext('2d',{willReadFrequently:true}),canvastx=$('textCanvas'),imageObj=new Image(),draggedOnce=false,images=['aaa.jpg','bbb.jpg','ccc.jpg','ddd.jpg','eee.jpg'],defaultImage=0,canvas1=document.createElement('canvas');document.body.appendChild(canvas1);
canvas1.id='canvas1';canvas1.hidden='hidden';
var canvas2=document.createElement('canvas');
document.body.appendChild(canvas2);
canvas2.id='canvas2';canvas2.hidden='hidden';
var tilings=['','','',new KisrhombilleTiling(),new PieTiling()];
//navigator.connection.downlink //' Mb/s'
function $(a){return document.getElementById(a)?document.getElementById(a):false}
function meinNull(){}

function copyArray(a){var ar=[],arr=function(b,c){var ar2=[];
if(Array.isArray(b)){for(var ii=0;ii<b.length;ii++){Array.isArray(b[ii])?arr(b[ii],ar2):ar2.push(b[ii])}c.push(ar2);ar2=[]}};
if(Array.isArray(a)){for(var i=0;i<a.length;i++){Array.isArray(a[i])?arr(a[i],ar):ar.push(a[i])}}
return ar
}

function actDateStr(){var dt=new Date(),
  tx=dt.toLocaleString().replace('202','2').replace(/(\.|,|:|;| )/g,'');return tx}

function thumbnailClick(newImgPath,sel,tx,xx){thClickTx=tx;
	var alli=document.getElementById('allImages').getElementsByTagName('li');
	for(var i=0;i<alli.length;i++){alli[i].id=i==sel?'liactivesid':''}
	loadCanvasImage(newImgPath,tx,function(){
		$('theImage').setAttribute('xlink:href', newImgPath);
		document.getElementById('allImages').style.display='none';
		updateScreenElemsSize();
		changeCSS();
	},xx)
}

function newCanAddTx(ca){var c=cloneCanvas(ca);c.getContext('2d').drawImage(canvastx,0,0);return c}

function saveKalendoscopeImage(){var ca=$('textGif').value!=''?newCanAddTx(canvas):canvas;
	var dataURL=ca.toDataURL('image/png').replace('image/png','image/octet-stream'),
	a=document.createElement('a'),nam=actDateStr();a.href=dataURL;
    a.download='kaleidoscope'+nam+'.png';
    document.body.appendChild(a);a.click();
	$('infokaleid').style.display='inline-block';
	$('infokaleid').innerHTML=
	'<b>Saved: kaleidoscope'+nam+'.png (Size: '+fileSizeKbMb(dataURL.length/1365)+', '+canvasWidthHeight[0]+'x'+canvasWidthHeight[1]+' px)</b>';
}
function saveKalendoscopeImJpg(){
	saveasjpg=true;changeCSS();var ca=$('textGif').value!=''?newCanAddTx(canvas):canvas;
	var dataURL=ca.toDataURL('image/jpeg',0.9),
	a=document.createElement('a'),nam=actDateStr();a.href=dataURL;
    a.download='kaleidoscope'+nam+'.jpg';
    document.body.appendChild(a);
    a.click();saveasjpg=false;changeCSS();
	$('infokaleid').style.display='inline-block';
	$('infokaleid').innerHTML=
	'<b>Saved: kaleidoscope'+nam+'.jpg (Size: '+fileSizeKbMb(dataURL.length/1365)+', '+canvasWidthHeight[0]+'x'+canvasWidthHeight[1]+' px)</b>';
}
function saveKalendoscopeImWebp(){var ca=$('textGif').value!=''?newCanAddTx(canvas):canvas;
	var dataURL=ca.toDataURL('image/webp'),
	a=document.createElement('a'),nam=actDateStr();a.href=dataURL;
    a.download='kaleidoscope'+nam+'.webp';
    document.body.appendChild(a);a.click();
	$('infokaleid').style.display='inline-block';
	$('infokaleid').innerHTML=
	'<b>Saved: kaleidoscope'+nam+'.webp (Size: '+fileSizeKbMb(dataURL.length/1365)+', '+canvasWidthHeight[0]+'x'+canvasWidthHeight[1]+' px)</b>';
}
function saveKalendoscopeImGif(){
	var dataURL=$('sampleimage').src,
	a=document.createElement('a'),nam=actDateStr();a.href=dataURL;
    a.download='kaleidoscope'+nam+'.gif';
    document.body.appendChild(a);a.click();
	//$('infokaleid').style.display='inline-block';
	//$('infokaleid').innerHTML=
	//'<b>Saved: kaleidoscope'+nam+'.gif (Size: '+fileSizeKbMb(dataURL.length/1365)+', '+canvasWidthHeight[0]+'x'+canvasWidthHeight[1]+' px)</b>';
}

function switchShape(til){
	currentTiling=tilings[til];currentTilingNum=til;changeCSS()
}
function fileSizeKbMb(kb){kb=~~kb;
var mb=kb>999?(kb/1000).toString().replace('.',',')+' Mb':kb+' Kb';
return mb
}

function readFile(file,org){
  var URL,url,img;$('progress-bar').style.display='block';
  var promise=new Promise(function(resolve){
    URL=window.webkitURL||window.URL;
    url=URL.createObjectURL(file);img=new Image();
    img.onload=function(){resolve('done')};img.src=url;  
  });
  promise.then(function(result){
		if(url!==null&&url!==undefined){var dc=img.src,w=img.width,h=img.height;
			if(w>2500||h>2500){
			var tc=document.createElement('canvas'),tct=tc.getContext('2d',{willReadFrequently:true});
			tc.width=w;tc.height=h;tct.drawImage(img,0,0);
			if(img.width>2500){w=2500;h=~~(w*tc.height/tc.width)}
			if(h>2500){h=2500;w=~~(h*tc.width/tc.height)}
			var her=new Hermite_class();her.resample(tc,w,h,true,function(){dc=tc.toDataURL();
			var orgg=org=='z'?'from clipboard':file.name;
		orgg=orgg==undefined?org:orgg;
		var imi=[w,h,orgg,1,Date.now()];
		addImageToImagesUL($('imagesNew'),dc,imi);
		thumbnailClick(dc,(liactives-1),imi,1);});}else{
		var orgg=org=='z'?'from clipboard':file.name;
		orgg=orgg==undefined?org:orgg;
		var imi=[w,h,orgg,1,Date.now()];
		addImageToImagesUL($('imagesNew'),dc,imi);
		thumbnailClick(dc,(liactives-1),imi,1);}
		setTimeout(function(){$('progress-bar').style.display='none'},300);
	}else{$('progress-bar').style.display='none'}
    return
  });
}

function startR(e){var file,allfil;
try{if(e.target.files||e.files||e.dataTransfer.files){
allfil=(e.target.files||e.files||e.dataTransfer.files);
if(allfil.length){for(var i=0;i<allfil.length;i++){
file=allfil[i];readFile(file,0)}}
$('filform').reset()}}catch(er){return false}
}

function fotoInHdd(){$('fileField1').addEventListener('change',startR,false);$('fileField1').click();return false}

function clipIchNew(){
var _self=this,ctrl_pr=false,com_pr=false,pasteEsup=true,pastdiv;
var txt_akt=function(){var ael=document.activeElement;
if((ael!=undefined&&ael.type=='text')||(ael!=undefined&&ael.tagName.toLowerCase()=='textarea')){return true}else{return false}};
this.init=function(){pastdiv=document.createElement('div');pastdiv.setAttribute('id','pasteff');
pastdiv.setAttribute('contenteditable','');
pastdiv.style.cssText='opacity:0;position:fixed;top:0px;left:0px;max-width:10px;margin-left:-20px;';
document.body.appendChild(pastdiv);
var MutationObserver=window.MutationObserver||window.WebKitMutationObserver||false;
if(MutationObserver){var observer=new MutationObserver(function(mut){mut.forEach(function(m){
if(pasteEsup==true||ctrl_pr==false||m.type!='childList'){return true}
if(m.addedNodes.length==1){if(m.addedNodes[0].src!=undefined){
var fil=m.addedNodes[0].src,byteSt;
if(fil.split(',')[0].indexOf('base64')>=0)byteSt=atob(fil.split(',')[1]);
else byteSt=unescape(fil.split(',')[1]);
var mimeSt=fil.split(',')[0].split(':')[1].split(';')[0],ia=new Uint8Array(byteSt.length);
for(var i=0;i<byteSt.length;i++){ia[i]=byteSt.charCodeAt(i)}
var file=new Blob([ia],{type:mimeSt});readFile(file,0)}
setTimeout(function(){pasteEsup=true},20)}else{return false}});});
var tad=$('infokaleid'),conf={attributes:true,childList:true,characterData:true,subtree:true};
observer.observe(tad,conf)}}();
this.paste_auto=function(e){if(!txt_akt()){pasteEsup=false;
if(e.clipboardData){var items=e.clipboardData.items;if(items){pasteEsup=true;
for(var i=0;i<items.length;i++){if(items[i].type.indexOf('image')!==-1){var blob=items[i].getAsFile();
readFile(blob,'z')}else{e.preventDefault()}}}}}};
this.on_keyact=function(event){if(!txt_akt()){var k=event.keyCode;
if(k==17||event.metaKey||event.ctrlKey){if(ctrl_pr==false)ctrl_pr=true}//ctrl
if(k==86){if(txt_akt()){return false}//v
if(ctrl_pr==true&&pastdiv!=undefined){pastdiv.focus()}}}};
this.on_keyup=function(event){if(!txt_akt()){if(event.ctrlKey==false&&ctrl_pr==true){ctrl_pr=false}
else if(event.metaKey==false&&com_pr==true){com_pr=false;ctrl_pr=false}}};
//document.addEventListener('keydown',function(e){_self.on_keyact(e)},false);
//document.addEventListener('keyup',function(e){_self.on_keyup(e)},false);
document.addEventListener('paste',function(e){_self.paste_auto(e)},false);
}
clipIchNew();


async function pasteImage(){
  try{const permission=await navigator.permissions.query({name:'clipboard-read'});
    if(permission.state==='denied'){console.error('Not read clipboard')}
    const clipboardContents=await navigator.clipboard.read();
    for(const item of clipboardContents){
      if(!item.types.includes('image/png')){console.error('Non-image')}
      const blob=await item.getType('image/png');readFile(blob,'z')
    }
  }catch(error){console.error(error.message)}
}

function drawImageToCanvas(){	
	var shapeW=imageObj.width*theCutRel.w,shapeH=imageObj.height*theCutRel.h,	
	ctx=canvas1.getContext('2d'),pieAngle=Math.PI/sectorSlider2set;
	var can1w=imageObj.width,can1h=imageObj.height;
	canvas1.width=can1w;
	canvas1.height=can1h;
	ctx.clearRect(-can1w/2,-can1h/2,can1w,can1h);
	ctx.drawImage(imageObj,0,0,can1w,can1h);
    ctx.globalCompositeOperation='destination-in';
				ctx.save()
				ctx.translate(theCutRel.x*imageObj.width+shapeW/2,theCutRel.y*imageObj.height)
				ctx.rotate(rotateTilingSet*Math.PI/180)
				ctx.beginPath()
				if(currentTilingNum==4){
					ctx.moveTo(-shapeW/2,0)
					ctx.arc(-shapeW/2,0, shapeW, -0.004, pieAngle+0.004)
				}else{
					ctx.moveTo(-shapeW/2-0.4,0);
					ctx.lineTo(shapeW/2-0.4,0)
					ctx.lineTo(shapeW/2-0.4, shapeH+0.4)}
				ctx.fillStyle='blue';
				ctx.fill();
				ctx.closePath();
				ctx.restore();
				
				var ctx2=canvas2.getContext('2d', { willReadFrequently: true }),
				can2w=currentTilingNum!=4?shapeH*2:shapeW,
				can2h=currentTilingNum!=4?shapeH*2:shapeH<shapeW?shapeW:shapeH;
				canvas2.width=can2w;
				canvas2.height=can2h;
				ctx2.clearRect(-can2w/2,-can2h/2,can2w,can2h);
				ctx2.filter=currentFilter;
				ctx2.save();
				ctx2.translate(can2w/2,0);
				ctx2.rotate(-rotateTilingSet*Math.PI/180);
				ctx2.drawImage(canvas1,
				imageObj.width * theCutRel.x,
				imageObj.height * theCutRel.y-shapeW/2,
				shapeW,shapeW,
				-can2w/2,-can2w/2,can2w,can2w);
				ctx2.restore();
				if(transpsets[3]>0&&setMouseSelColor){
				var dat=setTranspColors(ctx2,can2w,can2h);
				ctx2.putImageData(dat, 0, 0);
				}
}

function drawTileToCanvas(scale){var offset=0.6;
	context.drawImage(canvas2,0,0,canvas2.width,canvas2.height,
			-offset-3,-offset,canvas.width/2*scale+offset,canvas.width/2*scale+offset);
}

function KisrhombilleTiling(){
	var copies=copiesKisrhombille,self=this,rotations=6,
	angle=Math.PI/rotations,offset=0.5,offset2=-0.6,scale=1;
	switch(copies){
	case 0:scale=1.43*0.3;break;
	case 1:scale=0.83*0.3;break;
	case 2:scale=0.83*0.3;break;
	case 3:scale=0.71*0.3;break;
	case 4:scale=0.63*0.3;break;
	case 5:scale=0.55*0.3;break;
	case 6:scale=0.55*0.3;break;
	case 7:scale=1*0.3;break;
	case 8:scale=1*0.3;break;
	case 9:scale=1.43*0.3;break;
	}
	self.getRatio=function(){return Math.sqrt(3)}	
	self.path=function(){
		var ho=imgInSvgWidth*theCutRel.w,hy=ho/(Math.sqrt(3)/2);
		return 'M0,0 L'+ho+',0 L'+ho+','+hy/2+' Z'
	}	
	self.draw=function(){drawImageToCanvas(scale);
		var ho=getCutWidthForCanvas(scale),hy=ho/(Math.sqrt(3)/2);
		context.save();
		for(var j=0;j<rotations;j++){
			context.rotate(2*angle);
			for(var i=0;i<2;i++){
				for(var k=0;k<=copies;k++){
					context.save();
					context.scale(1,Math.pow(-1,i));
					switch(k){
					case 1:context.translate(-ho*2+offset,0);break;
					case 2:context.translate(-ho+offset/2,-hy*3/2+offset);break;
					case 3:context.translate(-ho+offset,hy*3/2-offset);break;
					case 4:context.translate(ho-offset,-hy*3/2+offset);break;
					case 5:context.translate(ho-offset,+hy*3/2-offset);break;
					case 6:context.translate(ho*2-offset,0);break;
					case 7:context.translate(ho*4,0);break;
					case 8:context.translate(ho*4,0);break;
					case 9:context.translate(ho*4,0);break;
					}
					context.beginPath();
					context.moveTo(offset2,offset2/2);
					context.lineTo(ho+offset,offset2*2);
					context.lineTo(ho+offset,hy/2+offset*2);
					context.closePath();
					context.clip();			
					drawTileToCanvas(1);
					context.restore();
				}
			}
		}	
		if(copiesKisrhombille==8&&(meinbgcolor!='transparent'||saveasjpg)){
		context.drawImage(newCanvasCopy,-canvas.width/2,-canvas.height/2);
		}else if(copiesKisrhombille==8&&meinbgcolor=='transparent'&&!saveasjpg){
		context.globalCompositeOperation='destination-in';
		context.beginPath();
		context.arc(0,0,canvas.width/2,0,2*Math.PI);
		context.fillStyle='#000';
		context.fill();
		context.closePath();	
		}
		context.restore()
	}
}

function describeArc(x,y,radius,startAngle,endAngle){
	var pc=function(cX,cY,r,ang){var an=(ang-90)*Math.PI/180.0;
	return{x:cX+(r*Math.cos(an)),y:cY+(r*Math.sin(an))}},
	start=pc(x,y,radius,endAngle),end=pc(x,y,radius,startAngle),
    arcSweep=endAngle-startAngle<=180?'0':'1';
    var d=['M',start.x,start.y, 
        'A',radius,radius,0,arcSweep,0,end.x,end.y,
        'L',x,y,'L',start.x,start.y].join(' ');
    return d;       
}

function PieTiling(){
	var self=this,pieAngle=Math.PI/sectorSlider2set,
	offset=0.08,scale=scalePieTiling;
	self.getRatio=function(){return 1/Math.sin(pieAngle)}	
	self.path=function(){
		var ora=imgInSvgWidth*theCutRel.w;
		return describeArc(0,0,ora,90,(90+pieAngle*180/Math.PI))
	}	
	self.draw=function(){drawImageToCanvas(scale);
		var ora=getCutWidthForCanvas(scale);
		context.save();context.rotate(-Math.PI/2);
		for (var j=0; j<sectorSlider2set; j++) {
			context.rotate(2*pieAngle);
			for (var i=0; i<2;i++) {
				context.save();
				context.scale(1,Math.pow(-1, i));
				context.beginPath();
				context.moveTo(0, 0);
				context.arc(0, 0, ora*scale, -offset, pieAngle+offset);
				context.closePath();
				context.clip();
				drawTileToCanvas(scale);
				context.restore()
			}
		}
		if(setsShapesSel==1){
		var drawStar=function(cx,cy,spikes,ora,ira){
		var rot=Math.PI/2*3,x=cx,y=cy,step=Math.PI/spikes;
		context.globalCompositeOperation='destination-in';
		context.beginPath();
		context.moveTo(cx,cy-ora);
		for(var i=0;i<spikes;i++){
			x=cx+Math.cos(rot)*ora;y=cy+Math.sin(rot)*ora;
			context.lineTo(x,y);rot+=step;
			x=cx+Math.cos(rot)*ira;y=cy+Math.sin(rot)*ira;
			context.lineTo(x,y);rot+=step
			}
		context.lineTo(cx,cy-ora);context.closePath();
		context.fillStyle='#000';context.fill()
		};
		var or=canvas.width>canvas.height?canvas.width/2:canvas.height/2,
		ir=or/2+(or/2/40*sectorSlider2set);
		context.restore();
		context.save();
		context.rotate(pieAngle*2);
		drawStar(0,0,sectorSlider2set,or,ir);
		if(meinbgcolor!='transparent'||saveasjpg){
			context.globalCompositeOperation='destination-over';
			if(vignetteset&&meinbgcolor!='transparent'){
				$('vignette-pointlight').setAttribute('x',canvasWidthHeight[0]/2);
				$('vignette-pointlight').setAttribute('y',canvasWidthHeight[1]/2);
				$('vignette-flood').setAttribute('flood-opacity',canvasVignette);
				context.filter='url(#image-filter)';}	
			var bgcolor=meinbgcolor!='transparent'?meinbgcolor:'#fff';
			context.fillStyle=bgcolor;
			context.rect(-canvas.width,-canvas.height,canvas.width*2,canvas.height*2);
			context.fill();	
		}
		}
		context.restore();
	}	
}

function correctForShapeToImageRatio(){var scale=1;
	if(currentTiling.getRatio()<imageObj.width/imageObj.height){
		if(currentTiling.getRatio()>=1){scale=theCutRel.h/theCutRel.w
		}else{scale=imageObj.width/imageObj.height}
	}else{
		if(currentTiling.getRatio()>=1){
		}else{scale=(theCutRel.w*imageObj.width)/(theCutRel.h*imageObj.height)}
	}
	return scale
}

function getCutWidthForCanvas(scale){
	return canvas.width*theCutRel.w/shapeScaleInSrcImg*scale*correctForShapeToImageRatio()
}

function startDownload(){
	var urls=$('addImageUrlIn').value;
	fetch(urls).then(response=>response.blob()).then(blob=>{
    const url=URL.createObjectURL(blob);
    var im=[0,0,'url:'+urls,1];
	addImageToImagesUL($('imagesNew'),url,im,Date.now());
	thumbnailClick(url,(liactives-1),im,1);
	$('addImageUrlIn').placeholder='https://www........';
	$('addImageUrlIn').value='';
  }).catch(function(err){$('addImageUrlIn').value='';
  $('addImageUrlIn').placeholder='Error url or no image';
});
}

function writeImagesToHTML(mx){$('imagesUl').innerHTML='';
	if(mx==5)localStorage.setItem('startimg','set');
	else if(mx==2&&localStorage.getItem('startimg')&&localStorage.getItem('startimg')=='set'){mx=5}
for(var i=0;i<mx;i++){
		addImageToImagesUL($('imagesUl'),'data/'+images[i],[1024,1024,images[i],777,0])
	}
var tClip=typeof ClipboardItem==='function'?'inline-block':'none';
$('clipboardDiv').style.display=tClip;
$('fromClipboard').style.display=tClip;
}

function addImageToImagesUL(uli,url,tx){
	var im=uli.getElementsByTagName('img'),go=1,
		alt=(tx[2]!=''?tx[2]+' ':'')+tx[0]+'x'+tx[1]+' px ';
for(var i=0;i<im.length;i++){if(im[i].alt==alt)go=0}
if(uli.id=='imagesNew'&&im.length>0){
	var detMib='';$('imagesInfo').style.display='block';
	if('storage' in navigator&&'estimate' in navigator.storage){
		navigator.storage.estimate().then(({usage,quota})=>{
    const pUsed=Math.round(usage/quota*100);
    const uMib=Math.round(usage/(1024*1024));
    const qMib=Math.round(quota/(1024*1024));
    $('imagesInfo2').innerHTML=pUsed>0?'<br>You\'re currently using about '+uMib+' MB ('+pUsed+'%) of your available storage.':''});}
	}
	if(go||uli.id=='imagesUl'){
	var ulli=uli.appendChild(document.createElement('li'));
		ulli.setAttribute('onclick', 'thumbnailClick(\''+url+'\','+liactives+',['+tx[0]+','+tx[1]+',\''+tx[2]+'\','+tx[3]+'],1)');
		ulli.setAttribute('class', 'imgSel tooltip');
		ulli.setAttribute('onmouseover','void(0)');
	var udb=ulli.appendChild(document.createElement('div'))
		.appendChild(document.createElement('b'));
		udb.innerHTML='Image: '+alt;
	var uimg=ulli.appendChild(document.createElement('img'));
		uimg.setAttribute('class', 'imageAddView')
		uimg.setAttribute('src', url)
		uimg.setAttribute('style', 'height:60px;width:auto;')
		uimg.setAttribute('alt',alt);
		if(liactives==0)document.getElementById('allImages').getElementsByTagName('li')[0].id='liactivesid';
	liactives++}
	if(uli.id=='imagesUl'){
		if(localStorage.getItem('startimg')&&localStorage.getItem('startimg')=='set'){}
		else if(im.length==2){ulli=uli.appendChild(document.createElement('li'));
		ulli.setAttribute('onclick', 'writeImagesToHTML(5)');
		ulli.setAttribute('class', 'imgmore');
		ulli.setAttribute('onmouseover','void(0)');
		udb=ulli.appendChild(document.createElement('div'));
		udb.innerHTML='+Images';}}
}

function canvasImageb64(img){var c=document.createElement('canvas');
c.width=img.naturalWidth;c.height=img.naturalHeight;
c.getContext('2d').drawImage(img,0,0);return c.toDataURL('image/jpeg',0.8);
}

function loadCanvasImage(imgPath,tx,callback,cc){
	imageObj.onload=function(){if(callback!==undefined){callback();
	if(cc)saveAppToDb((tx[3]==777?imageObj.src:canvasImageb64(imageObj)),tx,18)}};
	imageObj.src=imgPath
}

function updateSVGTranslation() {
	var gr=rotateTilingSet==180||rotateTilingSet==360?0:rotateTilingSet,
	rh=theCutRel.h*Math.sin(gr*Math.PI/180),rw=theCutRel.w*1;
	theCutRel.w=Math.max(0.01, theCutRel.w)
	theCutRel.h=Math.max(0.01, theCutRel.h)
	theCutRel.w=Math.min(1, theCutRel.w)
	theCutRel.h=Math.min(1, theCutRel.h) 
	theCutRel.x=Math.max(-rw, theCutRel.x)
	theCutRel.y=Math.max(-rh, theCutRel.y)
	theCutRel.x=Math.min(1+rw, theCutRel.x)
	theCutRel.y=Math.min(1+rh, theCutRel.y)
	var tr='rotate('+rotateTilingSet+' '+(theCutRel.x*imgInSvgWidth+theCutRel.w*imgInSvgWidth/2)+
	' '+(theCutRel.y*imgInSvgHeight)+') translate('+(theCutRel.x*imgInSvgWidth)+','+(theCutRel.y*imgInSvgHeight)+')';
	$('theClipPath').setAttribute('transform', tr)
	$('refGroup').setAttribute('transform', tr)
}

function updateOnResizeOrImageSwitch() {
	updateSVGTranslation();
	$('arcPath').setAttribute('d', currentTiling.path());
	$('theClipPathPath').setAttribute('d', currentTiling.path());
	clearCanvas();
	drawCurrent();
	if($('gifImages').style.display!='block')textCanvasGp();
}

function cloneCanvas(oldCanvas) {
    var newCanvas=document.createElement('canvas'),
    cont=newCanvas.getContext('2d');
    newCanvas.width=oldCanvas.width;
    newCanvas.height=oldCanvas.height;
    cont.drawImage(oldCanvas, 0, 0);
    return newCanvas;
}

function clearCanvas(){
	context.clearRect(-canvas.width/2,-canvas.height/2,canvas.width,canvas.height);
	context.beginPath();var bgcolor=meinbgcolor;
	if(vignetteset&&meinbgcolor!='transparent'){
		$('vignette-pointlight').setAttribute('x',canvasWidthHeight[0]/2);
		$('vignette-pointlight').setAttribute('y',canvasWidthHeight[1]/2);
		$('vignette-flood').setAttribute('flood-opacity',canvasVignette);
		context.filter='url(#image-filter)';}
	else if(meinbgcolor!='transparent'){}
	else if(saveasjpg){bgcolor='#fff'}
	context.fillStyle=bgcolor;
	context.rect(-canvas.width/2,-canvas.height/2,canvas.width,canvas.height);
	context.fill();
	context.filter='none';
	if((setsShapesSel==1||(copiesKisrhombille==8&&currentTiling==tilings[3]))&&(meinbgcolor!='transparent'||saveasjpg)){
		context.globalCompositeOperation='destination-out';
		context.beginPath();
		context.arc(0,0,canvas.width/2,0,2*Math.PI);
		context.fillStyle='#000';
		context.fill();
		context.closePath();
		context.globalCompositeOperation='source-over';
		newCanvasCopy=cloneCanvas(canvas)
		}
}

function setCutRelWandH(){
	if(imgInSvgWidth/imgInSvgHeight<currentTiling.getRatio()){
		theCutRel.w=shapeScaleInSrcImg;
		theCutRel.h=shapeScaleInSrcImg/currentTiling.getRatio()*imgInSvgWidth/imgInSvgHeight
	}else{theCutRel.h=shapeScaleInSrcImg;
		theCutRel.w=shapeScaleInSrcImg*currentTiling.getRatio()*imgInSvgHeight/imgInSvgWidth
	}
}

function updateScreenElemsSize(notSVG) {
	canvas.setAttribute('height',canvasWidthHeight[1]);
	canvas.setAttribute('width',canvasWidthHeight[0]);
	context.translate(canvasWidthHeight[0]/2,canvasWidthHeight[1]/2);
	canvastx.setAttribute('height',canvasWidthHeight[1]);
	canvastx.setAttribute('width',canvasWidthHeight[0]);	
	if (notSVG === undefined) {
		var imageRatio=imageObj.height/imageObj.width;
		imgInSvgWidth=180;
		imgInSvgHeight=Math.round(imgInSvgWidth * imageRatio);//$('KaleidosSp').offsetWidth
		$('svgdiv').setAttribute('style', 'width: '+imgInSvgWidth+'px; height: '+imgInSvgHeight+'px;');
		$('filtercss').style.display=imgInSvgHeight>imgInSvgWidth+20&&document.body.clientWidth>899?'inline-block':'block'
	}
	$('cansizeview').innerHTML='#canvasFrame:before{content:\'Canvas: '+
	canvas.width+'x'+canvas.height+'px ('+~~(canvas.clientWidth/canvas.width*100)+'%)\';}';
}

function dragMove(dx,dy){
	if(!draggedOnce){$('startupHelp').setAttribute('style','max-height:0;');
	draggedOnce=true}
	theCutRel.x+=(dx/imgInSvgWidth);
	theCutRel.y+=(dy/imgInSvgHeight);
	updateSVGTranslation();
	clearCanvas();drawCurrent()
}
function setMoveCut(dx,dy){
	theCutRel.x=dx;theCutRel.y=dy;
	updateSVGTranslation();
	clearCanvas();drawCurrent()
}
function slider0inpv(){slider0inp(this.value)}
function slider0inp(v){
var val=~~v;rotateTilingSet=val;
$('slider0').value=v;
$('slider0b').innerHTML='Rotate: 0-360° ('+val+'°)';
$('resetAllFilterEx').disabled=false;
changeCSS()
}
function slider1inpv(){slider1inp(this.value)}
function slider1inp(v){
var svalue=~~(v*100);
$('slider1').value=v;
$('slider1b').innerHTML='ZOOM Tiele ('+svalue+')';
shapeScaleInSrcImg=v;
$('resetAllFilterEx').disabled=false;
changeCSS()
}
function slider2inpv(){slider2inp(this.value)}
function slider2inp(v){
$('resetAllFilterEx').disabled=false;
var spsn=setsShapesSel==1?'3-32 Spikes':'3-32 SECTORs';
var val=~~v;
$('slider2b').innerHTML=spsn+' ('+val+')';
$('slider2').value=v;
sectorSlider2set=val;
tilings[4]=new PieTiling();
switchShape(4)
}

function slider4inpv(){slider4inp(this.value)}
function slider4inp(v){
var val=~~v;
$('slider4').value=v;
$('wcansitze').value=val;
$('hcansitze').value=val;
$('kaleidoCanvas').style.width=(val<1100?val:1100)+'px';
$('textCanvas').style.width=(val<1100?val:1100)+'px';
$('csscansize').innerHTML='#wcansize:before{content:\'\';}#hcansize:before{content:\'\';}';
canvasWidthHeight[0]=val;canvasWidthHeight[1]=val;
updateScreenElemsSize('');
changeCSS();
if($('gifImages').style.display!='block')textCanvasGp();
}

function runAfterImageFinishedLoading(){
document.getElementsByTagName('body')[0].ondragover=function(){return false};
document.getElementsByTagName('body')[0].ondragenter=function(){return false};
document.getElementsByTagName('body')[0].ondrop=function(e){startR(e);return false};
var cont=$('filtercss').querySelectorAll('input');
for(con of cont){con.setAttribute('oninput','changeCSSin(\'\');return false;')}
if(navigator.share===undefined){$('shareAsGif').style.display='none'}
	$('slider0').addEventListener('input',slider0inpv);
	$('slider1').addEventListener('input',slider1inpv);
	$('slider2').addEventListener('input',slider2inpv);
	$('slider4').addEventListener('input',slider4inpv);			
	var legends=document.getElementsByTagName('legend');
	for(var k=0;k<legends.length;k++){
	legends[k].setAttribute('onclick','clFieldsets('+k+')');
	}
	writeImagesToHTML(2);
	updateScreenElemsSize();
	setCutRelWandH();
	theCutRel.x=(1-theCutRel.w)/2;
	theCutRel.y=(1-theCutRel.h)/2;
	theCutRelxy=[(1-theCutRel.w)/2,(1-theCutRel.h)/2];
changeCSS();
}

function clFieldsets(ii){if($('KaleidosSp').clientHeight<500){
	var fs=document.getElementsByTagName('fieldset'),
	hg=fs[ii].style.position=='absolute'?1:0,
	pt=localStorage.getItem('preferred-theme');
	for(var i=0;i<fs.length;i++){fs[i].style.zIndex='10';
	fs[i].style.maxHeight='15px';fs[i].style.position='static';
	fs[i].getElementsByTagName('legend')[0].style.background=pt&&pt=='light'?'#1bf':'#026';
	fs[i].getElementsByTagName('legend')[0].getElementsByTagName('k')[0].style.color='transparent';
	}
	fs[ii].style.maxHeight=hg==1?'15px':'399px';
	fs[ii].style.position=hg==1?'static':'absolute';
	fs[ii].style.zIndex=hg==1?'10':'99';
	fs[ii].getElementsByTagName('legend')[0].style.background=
	hg==1?(pt&&pt=='light'?'#1bf':'#026'):(pt&&pt=='light'?'#7fc':'#053');
	fs[ii].getElementsByTagName('legend')[0].getElementsByTagName('k')[0].style.color=hg==1?'transparent':'red'}
}	
	
function handleMousemove(e,can,sel){if(can.isDrawing||(e.target.id=='svgUseShape'&&e.target.isDrawing)){
	var cScale=sel==0?1:canvas.width/Math.max(imgInSvgWidth,imgInSvgHeight)/4,
    xy=copyArray(xyHandle);mouseEvent(e);
	var x=xyHandle[0]-xy[0],y=xyHandle[1]-xy[1];x=isNaN(x)||x<-50||x>50?0:x;y=isNaN(y)||y<-50||y>50?0:y;
	dragMove(x/cScale,y/cScale);}
}


function activateDrawing(e,can){
xyHandle=mouseEvent(e);
$('resetAllFilterEx').disabled=false;can.isDrawing=true;
$('startupHelp').setAttribute('style','max-height:0;');
$('startupHelp2').setAttribute('style','max-height:0;');
}

function mouseEvent(e){
xyHandle=e.type==='touchmove'?[e.changedTouches[0].clientX,e.changedTouches[0].clientY]:[e.clientX,e.clientY]
}

function eventOutAll(){$('svgdiv').isDrawing=false;
$('svgUseShape').isDrawing=false;$('textCanvas').isDrawing=false;
setmouseov=1;this.isDrawing=false;
saveAppToDb(theCutRel.x,theCutRel.y,17);
}
function eventOutAlls(){$('svgdiv').isDrawing=false;setmouseov=1;
$('svgUseShape').isDrawing=false;$('textCanvas').isDrawing=false;
}

function hexToRgb(hex){var r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r?[parseInt(r[1],16),parseInt(r[2],16),parseInt(r[3],16)]:null;
}
function rgbToHex(r,g,b){return '#'+(1<<24|r<<16|g<<8|b).toString(16).slice(1)}

function savedTransp(p){transpsets[4]=1;
	transpsets[0]=p[0];transpsets[1]=p[1];transpsets[2]=p[2];
	$('setRemColor').value=rgbToHex(p[0],p[1],p[2]);
	if(setMouseSelColor){changeCSS()}
}
function clickTransp(e){if(setMouseSelColor){transpsets[4]=1;e.preventDefault();
			var ws=canvas.width/canvas.clientWidth,hs=canvas.height/canvas.clientHeight,
			x=e.layerX*ws,y=e.layerY*hs,p=context.getImageData(x,y,1,1).data;
			transpsets[0]=p[0];transpsets[1]=p[1];transpsets[2]=p[2];
			$('setRemColor').value=rgbToHex(p[0],p[1],p[2]);
			changeCSS();
			$('startupHelp').setAttribute('style','max-height:0;');
			saveAppToDb(3,[p[0],p[1],p[2]],12)}
}
function valueTransp(){if(setMouseSelColor){transpsets[4]=1;
			var p=hexToRgb($('setRemColor').value);
			transpsets[0]=p[0];transpsets[1]=p[1];transpsets[2]=p[2];
			$('startupHelp').setAttribute('style','max-height:0;');
			changeCSS()}
}

try{var opts=Object.defineProperty({},'passive',{
    get:function(){supportsPassive=true;}});
  window.addEventListener('testPassive',null,opts);
  window.removeEventListener('testPassive',null,opts);
}catch(e){}
$('svgUseShape').addEventListener('mousedown',function(){$('svgdiv').isDrawing=true;});
$('svgdiv').addEventListener('mousemove',function(e){handleMousemove(e,this,0)});
$('svgdiv').addEventListener('mousedown',function(e){activateDrawing(e,$('svgUseShape'))});
$('svgdiv').addEventListener('mouseup',eventOutAll);
$('svgdiv').addEventListener('touchmove',function(e){handleMousemove(e,this,0)},supportsPassive?{passive:true}:false);
$('svgdiv').addEventListener('touchstart',function(e){activateDrawing(e,$('svgUseShape'))},supportsPassive?{passive:true}:false);
$('svgdiv').addEventListener('touchend',eventOutAll);
$('svgdiv').addEventListener('click',function(){$('startupHelp2').style.maxHeight=0;});

$('textCanvas').addEventListener('click',clickTransp,false);
document.getElementsByTagName('body')[0].addEventListener('mouseup',eventOutAlls);
document.getElementsByTagName('body')[0].addEventListener('touchend',eventOutAlls);

function drawCurrent(){
	try{currentTiling.draw()}catch(err){
		if(err.name==='NS_ERROR_NOT_AVAILABLE'){
			window.setTimeout(function(){
				updateScreenElemsSize();changeCSS()},300)
		}else{}
	}
}

currentTiling=tilings[4];

window.onresize=function(e){$('cansizeview').innerHTML='#canvasFrame:before{content:\'Canvas: '+
canvas.width+'x'+canvas.height+'px ('+~~(canvas.clientWidth/canvas.width*100)+'%)\';}';};

updateScreenElemsSize('not SVG!');

function setCanSitze(){
var wc=$('wcansitze'),w=wc.value*1,
hc=$('hcansitze'),h=hc.value*1,
st=function(wt,ht){$('csscansize').innerHTML='#wcansize:before{content:\''+wt+'\';}#hcansize:before{content:\''+ht+'\';}'};
st('','');
if(isNaN(w)){st('Number!','')}
else if(isNaN(h)){st('','Number!')}
else if(w<50){st('min 50','')}
else if(h<50){st('','min 50')}
else if(w>1500){st('max 1500','')}
else if(h>1500){st('','max 1500')}
else{canvasWidthHeight=[~~w,~~h];
$('kaleidoCanvas').style.width=(w<1100?w:1100)+'px';
$('textCanvas').style.width=(w<1100?w:1100)+'px';
updateScreenElemsSize('');
changeCSS();
if($('gifImages').style.display!='block')textCanvasGp();
saveAppToDb(~~w,~~h,15)}
}

function formKalei(set,cop){
setKisrhombille=set;copiesKisrhombille=cop;
scalePieTiling=set==1?1.42:1;setsShapesSel=set==12?1:0;
$('slider2b').innerHTML=(set==12?'3-32 Spikes':'3-32 SECTORs')+' ('+sectorSlider2set+')';
for(var i=1;i<13;i++){
$('formKalei'+i).style.boxShadow=i==set?'0 0 8px #000 inset':'none';
$('formKalei'+i).style.outline=i==set?'2px solid #042cef':'none';
}
if(set>2&&set<12){tilings[3]=new KisrhombilleTiling();}else{tilings[4]=new PieTiling();}		
$('slider22').style.display=set>2&&set<12?'none':'inline-block';
set>2&&set<12?switchShape(3):switchShape(4);
saveAppToDb(set,cop,1)
}

function fotoClipboardWrite(){
	var ca=$('textGif').value!=''?newCanAddTx(canvas):canvas;
	$('infokaleid').style.display='inline-block';
	try {ca.toBlob((blob)=>{
      navigator.clipboard.write([
          new ClipboardItem({'image/png':blob})
      ]);
    },'image/png');
	$('infokaleid').innerHTML='<b>Copied!</b>'
} catch(error){$('infokaleid').innerHTML='<b style="color:red">Error!!!<br>'+error+'</b>'}
}
function myResetFunction(){
rotateTilingSet=0;
sectorSlider2set=12;shapeScaleInSrcImg=0.4;
$('slider0b').innerHTML='Rotate: 0-360° (0°)';
$('slider1b').innerHTML='ZOOM Tiele (40)';
$('slider2b').innerHTML='3-32 SECTORs (12)';
$('slider0').value=rotateTilingSet;
$('slider1').value=shapeScaleInSrcImg;
if(currentTilingNum==4){
$('slider2').value=sectorSlider2set;
tilings[4]=new PieTiling();switchShape(4)}
theCutRel.x=theCutRelxy[0];
theCutRel.y=theCutRelxy[1];
changeCSS();
$('resetAllFilterEx').disabled=true;
}

function resetAllCSS(){
currentFilter='';$('filtercss').reset();changeCSS();
$('resetAllFilter').disabled=true
}

function changeCSSin(ii){
if(ii==2){setMouseSelColor=document.getElementsByName('transpset')[0].value*1>0?1:0;
var mx=setMouseSelColor?($('kaleidoCanvas').clientWidth-20)+'px':0,
mh=setMouseSelColor?'200px':'0';
$('startupHelp').innerHTML='Select transparent color from image by click!'
$('startupHelp').setAttribute('style','max-width:'+mx+';max-height:'+mh+';');
transpsets[4]=setMouseSelColor;}else{
if($('resetAllFilter'+ii).disabled==true)
$('resetAllFilter'+ii).disabled=false}
changeCSS()
}

function changeCSS(){
		transpset();
        currentFilter =
          'brightness('+document.getElementsByName('brightness')[0].value+') '+
          'contrast('+document.getElementsByName('contrast')[0].value+') '+       
          'hue-rotate('+document.getElementsByName('hueRotate')[0].value+'turn) '+
          'invert('+document.getElementsByName('invert')[0].value+') '+
          'saturate('+document.getElementsByName('saturate')[0].value+') ';
          setCutRelWandH();
	updateOnResizeOrImageSwitch();
	
}

function transpset(){var trv=document.getElementsByName('transpset')[0].value*1;
setMouseSelColor=trv>0?1:0;transpsets[3]=trv;
$('textCanvas').className=setMouseSelColor?'kaleidoCanvasCr':'kaleidoCanvasCs';
}

function vignetteSet(){canvasVignette=document.getElementsByName('vignetteset')[0].value*1;
vignetteset=canvasVignette==0?0:1;changeCSS();
}
document.getElementsByName('transpset')[0].setAttribute('oninput','changeCSSin(2);return false;');
document.getElementsByName('vignetteset')[0].setAttribute('oninput','vignetteSet();return false;');

function infoResets(){$('infokaleid').innerHTML=''}
$('easytxt').onmouseout=infoResets;

loadCanvasImage('data/'+images[defaultImage],[1024,1024,'aaa.jpg',777,0],runAfterImageFinishedLoading,1);

function resetHcolor(){
document.getElementsByName('vignetteset')[0].value=0;
meinbgcolor='transparent';vignetteSet();
$('ResetHcolor').disabled=true;
$('selectedcolor').style.background=meinbgcolor;
$('selectedcolor').innerHTML='TRANSP.';
}

function writeHcolorSe(p){meinbgcolor=p;
$('ResetHcolor').disabled=false;
$('selectedcolor').style.background=p;
$('selectedcolor').innerHTML=p;
changeCSS();
}
$('setHcolor').setAttribute('oninput','writeHcolorSe(this.value)');
$('setHcolor').setAttribute('onchange','saveAppToDb(3,this.value,13);');

function setCssHelptoool(){
$('csshelptoool').innerHTML=
$('chCssHelptoool').checked==true?'':'div.tooltip:hover div,label.tooltip:hover div,.tooltip:hover #otherscolor{display:block;}';
}

function setStyleBlWt(ss){
	var pt=localStorage.getItem('preferred-theme');
	var s=pt&&pt=='light'?7:0;s=ss==77&&s==0?7:ss==77&&s==7?0:s;
	document.getElementsByTagName('body')[0].style.backgroundColor=s==7?'#fff':'#373737';
	document.getElementsByTagName('body')[0].style.color=s==7?'#333':'#eee';
	$('KaleidosSp').style.color=s==7?'#333':'#eee';
	$('Kaleidosh3').style.color=s==7?'#333':'#eee';
	$('KaleidosSp').style.backgroundImage='linear-gradient('+(s==7?'#74b4d9,#c3e8fd':'#0d0d0d,#2b2b2b')+')';
	$('allImages').style.background=s==7?'rgba(230,230,230,0.8)':'rgba(53,53,53,0.9)';	
	var fild=document.getElementsByTagName('fieldset');
	for(var i=0;i<fild.length;i++){
	fild[i].style.background=s==7?'#d4f0ff':'#676767';
	if(document.getElementsByTagName('legend')[i]){
	document.getElementsByTagName('legend')[i].style.background=s==7?'#1bf':'#026'}
	}
	var divs=$('easytxt').getElementsByClassName('inlineblock');
	for(var a=0;i<divs.length;a++){
	divs[a].style.background=s==7?'#d4f0ff':'#676767';
	}
	$('textinhalt').style.background=s==7?'#eeeeee':'#444545';
	$('lightmode').disabled=s==7?true:false;
	$('darkmode').disabled=s==7?false:true;
	$('cssmodes').innerHTML='label k{filter:'+(s==7?'none':'invert(100%) drop-shadow(0 0 3px #000)')+';}';
	$('lightdark').style.filter=s==7?'none':'invert()';
	var theme=s==7?'light':'dark';	
	localStorage.setItem('preferred-theme',theme);
}

var preferredTheme=localStorage.getItem('preferred-theme');
if(preferredTheme&&preferredTheme=='light'){setStyleBlWt(0)}
if(canvas.getContext&&canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0){$('webpbutton').style.display='inline-block'}

function setTranspColors(ct,w,h){transpset();
      var imgdt=ct.getImageData(0,0,w,h),dt=imgdt.data,
          i,r,g,b,c=copyArray(transpsets),ds=c[3]*255,
          lc=[c[0]-ds,c[1]-ds,c[2]-ds,],
          hc=[c[0]+ds,c[1]+ds,c[2]+ds,];
      for(i=0;i<dt.length;i+=4){r=dt[i];g=dt[i+1];b=dt[i+2];
        if(r>lc[0]&&g>lc[1]&&b>lc[2]&&r<hc[0]&&g<hc[1]&&b<hc[2]){dt[i+3]=0;}
      }
	return imgdt
}


function textCanvasGp(){
var txv=$('textGif').value,
tx_v=txv.replace(/(\r\n?|\r\n|\n\r|\r|\n|<br>|<BR>|<br>\n)/g,'<br>'),
tx_va=tx_v.split('<br>'),poscor=tx_va.length>1?tx_va.length:1;
$('textGif').style.fontFamily=$('gifFonts').value;
canvastx.getContext('2d').clearRect(0,0,canvastx.width,canvastx.height);
textCanSet(canvastx,tx_v,poscor,canvastx.width,canvastx.height);
$('fonstload').innerHTML = 'Font:' + $('gifFonts').value + ', ' + $('gifTxSize').value + ', ' + $('gifTxBoKs').value + ', ' + $('gifTxPos').value;
}

//['','#0000ff','#ffff00','Arial',48,'','middle']textCanvasGp()
function setNewFonts(){if($('stylefonts')){}
else{var cssff='@font-face{font-weight:normal;font-style:normal;font-display:swap;}',
styleSheet=document.createElement('style');
styleSheet.innerText=cssff;
styleSheet.id='stylefonts';
document.head.appendChild(styleSheet);
var font=['Arial','Helvetica','Georgia','Times New Roman','Lobster','Pacifico','Caveat','Jura'],
	fsel=$('gifFonts');if($('gifFonts').length<8)$('gifFonts').innerHTML='';
for(var i=0;i<font.length;i++){const detailsLi=document.createElement('option');
              detailsLi.style.fontFamily=font[i];
              detailsLi.value=font[i];
              detailsLi.text=font[i];
              fsel.append(detailsLi);
}}
var myFont=new FontFace('Lobster','url(css/lobster.woff2)');
myFont.load().then(function(font){document.fonts.add(font);
myFont=new FontFace('Pacifico','url(css/pacifico.woff2)');
myFont.load().then(function(font){document.fonts.add(font);
myFont=new FontFace('Caveat','url(css/caveat.woff2)');
myFont.load().then(function(font){document.fonts.add(font);
myFont=new FontFace('Jura','url(css/jura.woff2)');
myFont.load().then(function(font){document.fonts.add(font);
	var fa = allDataBefore[15][1][3], ft = fa == 'Pacifico' || fa == 'Caveat' || fa == 'Jura'?fa:'Lobster';
$('textGif').style.fontFamily=ft;
$('gifFonts').value=ft;	
if($('gifImages').style.display!='block'&&$('textGif').value!=''){textCanvasGp();}
$('fonstload').innerHTML = 'Lobster, Pacifico, Caveat and Jura loaded';
});});});});
}

function saveFonts(){return [$('textGif').value,$('gifTxColor').value,$('gifTxColor2').value,$('gifFonts').value,$('gifTxSize').value*1,$('gifTxBoKs').value,$('gifTxPos').value]
}
function gifShareSet(){if($('gifImages').style.display!='block'){textCanvasGp();saveAppToDb(0,saveFonts(),16)}}
function gifFontsSet(){if($('gifFonts').value=='arial '){setNewFonts()}
	else if($('gifImages').style.display!='block'){textCanvasGp();saveAppToDb(1,saveFonts(),16)}}
function gifTxSizeSet(){if($('gifImages').style.display!='block'){textCanvasGp();saveAppToDb(2,saveFonts(),16)}}
function gifTxBoKsSet(){if($('gifImages').style.display!='block'){textCanvasGp();saveAppToDb(3,saveFonts(),16)}}
function gifTxPosSet(){if($('gifImages').style.display!='block'){textCanvasGp();saveAppToDb(4,saveFonts(),16)}}
function gifShareSet1(){if($('gifImages').style.display!='block'){textCanvasGp();saveAppToDb(5,saveFonts(),16)}}
function gifShareSet2(){if($('gifImages').style.display!='block'){textCanvasGp();saveAppToDb(6,saveFonts(),16)}}
function gifTextDel(){if($('gifImages').style.display!='block'){$('textGif').value='';textCanvasGp();saveAppToDb(7,saveFonts(),16)}}

function textCanSet(ca,tx,ps,w,h){if(tx!=''){
var cte=ca.getContext('2d'),
txs=~~($('gifTxSize').value*(w/700)*1.3),
pos=$('gifTxPos').value=='top'?txs*1:$('gifTxPos').value=='middle'?h/2-(txs*ps/2)+txs/2:h-txs*ps;
cte.textAlign='center';
cte.textBaseline='middle';
cte.font=$('gifTxBoKs').value+''+txs+'px '+$('gifFonts').value;
cte.shadowColor='#333333';
cte.lineJoin='round';cte.miterLimit=2;
var tww=function(t_x){
cte.shadowBlur=txs/10;
cte.lineWidth=txs/12;
cte.strokeStyle=$('gifTxColor2').value;
cte.strokeText(t_x,w/2,pos);
cte.shadowBlur=0;cte.fillStyle=$('gifTxColor').value;
cte.fillText(t_x,w/2,pos)};
var txent=function(tx2){
var mess=cte.measureText(tx2).width;
if(mess<w-txs){tww(tx2)}else{
var ttt=tx2.split(' '),txn='',ms;
for(var m=0;m<ttt.length;m++){
ms=cte.measureText(txn+' '+ttt[m]).width;
ms>w-txs?(tww(txn),(txn=m<ttt.length-1?ttt[m]+' ':ttt[m]),pos+=txs):txn+=m<ttt.length-1?ttt[m]+' ':ttt[m];
}tww(txn)}};
var t_x2=tx.split('<br>');if(t_x2.length>1){
for(var s=0;s<t_x2.length;s++){txent(t_x2[s]);pos+=txs}
}else{txent(tx)}
}}

function buildGIF(w,h,imgs,set){
	var arr=copyArray(imCanvasGif);arr.reverse();
    $('allgifdone').innerHTML='';
	var gif=new GIF({
	workerScript:'gif.worker1.js',workers:2,
	width:w,height:h,repeat:0,//-1=no repeat
	//background:'#00FF00',
	quality:10,transparent:(allDataBefore[12][1]=='transparent'?'#000000':null)});
var txv=$('textGif').value,
tx_v=txv.replace(/(\r\n?|\r\n|\n\r|\r|\n|<br>|<BR>|<br>\n)/g,'<br>'),tx_va=tx_v.split('<br>'),
txva=tx_va.length>1?tx_va:txv.split(' '),poscor=tx_va.length>1?tx_va.length:1;
if(set<1){textCanSet(imgs,tx_v,poscor,w,h);gif.addFrame(imgs)}else{var txx='',imln=arr.length;
for(var i=0;i<imln;i++){txx+=(tx_va.length>1&&i<tx_va.length?txva[i]+'<br>':(i<txva.length?txva[i]+' ':''));
$('gifShare').checked&&tx_va.length>imln&&i==imln-1?txx+=''+tx_va.slice(imln).join('<br>'):
$('gifShare').checked&&txva.length>imln&&i==imln-1?txx+=''+txva.slice(imln).join(' '):meinNull();
textCanSet(arr[i],$('gifShare').checked?txx:tx_va.length>1?tx_v:txv,poscor,w,h);
gif.addFrame(arr[i],{delay:$('inputGifDelay').value*1})}}
gif.on('finished',function(blob){
			var sc=URL.createObjectURL(blob[0]);$('sampleimage').src=sc;gifimagebl=blob[0];
            if(set<1){$('allgifdone').innerHTML='New GIF Image ('+w+'x'+h+'px size: '+fileSizeKbMb(blob[1]/1000)+')'}
			else{$('allgifsdone').innerHTML='Animated GIF ('+w+'x'+h+'px size: '+fileSizeKbMb(blob[1]/1000)+') '+
			'<button onclick="saveKalendoscopeImGif();return false">Save as animated GIF image</button>';
			$('saveAs1Gif').style.display='none';
			for(var i=0;i<set;i++){redoHist()}setTimeout(textCanvasGp,300)}
	$('progress-bar').style.display='none'});
gif.render();
}

function shareAsGifs(){try{
	var file=new File([gifimagebl],'kaleidoscope'+actDateStr()+'.gif',{type:'image/gif'}),
	filesArray=[file],shareData={files:filesArray};
	if(navigator.canShare&&navigator.canShare(shareData)){
		shareData.title='Kaleidoscope';
		shareData.text='Create Kaleidoscopes from Photos';
		shareData.url=document.location.href;
		navigator.share(shareData)
    .then(()=>{console.log('Successful share')})
    .catch((error)=>{console.log('Error sharing',error)});
	}}catch(error){$('shareAsGif').disabled=true}
}
var gifimagebl;
async function dataUrlToBlob(url){
  return fetch(url).then((res)=>res.blob());
}
 
function shareAsPngs(){
  let ca=$('textGif').value!=''?newCanAddTx(canvas):canvas,
  url=ca.toDataURL('image/png'),txx='kaleidoscope'+actDateStr()+'.png';
  dataUrlToBlob(url).then((blob)=>{
    var file=new File([blob],txx,{type:'image/png'}),
    filesAr=[file],shareData={files:filesAr};
    if(navigator.canShare&&navigator.canShare(shareData)){
     shareData.title='Kaleidoscope';
	shareData.text='Create Kaleidoscopes from Photos';
	shareData.url=document.location.href;
     navigator.share(shareData)
        .then(()=>console.log('Successful share'))
        .catch((error)=>console.log('Successful share'));
    }else{}
  });
}

function gifKaleidoCl(){$('shareAsPng').disabled=false;$('gifImages').style.display='none';}

function newGifKaleido(){$('shareAsPng').disabled=true;
$('gifForShare').style.display = $('textGif').value!=''&&namesUndoRedo.length>3&&namesUndoRedo[namesUndoRedo.length-1]!=15&&namesUndoRedo[namesUndoRedo.length-2]!=15?'block':'none';
$('gifImages').style.display='block';$('progress-bar').style.display='block';
$('allgifsdone').innerHTML='';$('saveAs1Gif').style.display='inline-block';
var nl=namesUndoRedo.length;$('inputGifLng').max=nl;
if($('inputGifLng').value*1>nl)$('inputGifLng').value=nl;
$('GifLng').innerHTML=~~$('inputGifLng').value*1;
$('inputGifLng').addEventListener('input',e=>{$('GifLng').innerHTML=~~$('inputGifLng').value*1});
$('inputGifDelay').addEventListener('input',e=>{$('GifDelay').innerHTML=(~~$('inputGifDelay').value*1)/1000+' Sec.'});
buildGIF(canvasWidthHeight[0],canvasWidthHeight[1],cloneCanvas(canvas),0);
window.scrollTo(0,0);
}

function buildAniGIF(){$('gifImages').style.display='block';
$('progress-bar').style.display='block';
var lng=~~$('inputGifLng').value*1,ct=0;imCanvasGif=[];
const i=setInterval(function(){
	imCanvasGif.push(cloneCanvas(canvas));undoHist(1);ct++;
    if(ct==lng){clearInterval(i);buildGIF(canvasWidthHeight[0],canvasWidthHeight[1],1,lng);}},50);
}

localforage.config({
    driver:[localforage.INDEXEDDB,localforage.WEBSQL,localforage.LOCALSTORAGE],
    name:'Kaleido',storeName:'UndoRedo'
});

function readAppToDb(k){
localforage.getItem(k,function(err,val){return val})}
function removeAppToDb(k){
localforage.removeItem(k).then(function() {//key has been removed
  console.log('Key is cleared!')}).catch(function(err){console.log(err)})}
function clearAppToDb(){
localforage.clear().then(function(){// database deleted
    console.log('Database is now empty.')}).catch(function(err){console.log(err)})}



function setTxHistory(ar){
$('gifTxColor').value=ar[1];$('gifTxColor2').value=ar[2];$('gifFonts').value=ar[3]==''?'arial':ar[3];$('gifTxSize').value=ar[4];
$('gifTxBoKs').value=ar[5];$('gifTxPos').value=ar[6];$('textGif').value=ar[0];
setTimeout(textCanvasGp,300)
}

function setoAppFunc(abc,pp){if(Array.isArray(abc)){
var a=abc[0],b=abc[1],c=abc[2];pp=pp==1?1:0;
c==1?formKalei(a,b):
c==2?slider0inp(b*1):
c==3?slider1inp(b*1):
c==4?slider2inp(b*1):meinNull();
if(c>4&&c<10){var inp=$('filtercss').querySelectorAll('input');
$('resetAllFilter').disabled=false;
c==5?inp[0].value=b:
c==6?inp[1].value=b:
c==7?inp[2].value=b:
c==8?inp[3].value=b:
c==9?inp[4].value=b:meinNull();changeCSS()}
//c==10?(($('chTranspImg').checked=b==0?false:true),mychTranspImg()):'';
c==11?(document.getElementsByName('transpset')[0].value=b,changeCSS()):
c==12?savedTransp(b):
c==13?(b=='transparent'?resetHcolor():(writeHcolorSe(b),$('setHcolor').value=b)):
c==14?(document.getElementsByName('vignetteset')[0].value=b,vignetteSet()):meinNull();
if(c==15&&!pp){a==b?slider4inp(b*1):($('wcansitze').value=a,$('hcansitze').value=b,setCanSitze())}
c==16?setTxHistory(b):
c==17?setMoveCut(a,b):
c==18?thumbnailClick(a,'c',b,0):
c==19?myResetFunction():c==20?resetAllCSS():c==22?resetHcolor():
c==23?openDesignsSv(b):meinNull();
}}

function setAppMoment(){var allda=[[1,0,1],[1,0,2],[2,0.4,3],[3,12,4],[1,1,5],[2,1,6],[3,1,7],[4,0,8],[5,0,9],[1,0,10],[2,0,11],[3,[0,0,0],12],
	[2,'transparent',13],[3,0,14],[700,700,15],[0,['','#0000ff','#ffff00','Arial',48,'','middle'],16],[0.3,0.45,17],
	['data/aaa.jpg',[1024,1024,'aaa.jpg',777,0],18],[1,0,19],[2,0,20],[3,0,21],[4,0,22],[1,0,23]];
allda[0][0]=setKisrhombille;allda[0][1]=copiesKisrhombille;
allda[1][1]=rotateTilingSet;allda[2][1]=shapeScaleInSrcImg;allda[3][1]=sectorSlider2set;
var inp=$('filtercss').querySelectorAll('input');
allda[4][1]=inp[0].value*1;allda[5][1]=inp[1].value*1;
allda[6][1]=inp[2].value*1;allda[7][1]=inp[3].value*1;allda[8][1]=inp[4].value*1;
allda[10][1]=document.getElementsByName('transpset')[0].value*1;
allda[11][1]=[transpsets[0],transpsets[1],transpsets[2]];
allda[12][1]=meinbgcolor;
allda[13][1]=document.getElementsByName('vignetteset')[0].value*1;
allda[14][0]=canvasWidthHeight[0];allda[14][1]=canvasWidthHeight[1];
allda[15][1]=saveFonts();
allda[16][0]=theCutRel.x;allda[16][1]=theCutRel.y;
allda[17][0]=thClickTx[3]==777?imageObj.src:canvasImageb64(imageObj);allda[17][1]=thClickTx;
return allda;
}

function resetAllHist(){txHistIns=0;UndoRedoPos=0;namesUndoRedo=[];
setTxHistory(allDataSe[15][1]);allDataBefore=copyArray(allDataSe);
var date=new Date();
	localforage.setItem('UndoRedoPos',UndoRedoPos);
	localforage.setItem('UndoRedoDate',date.toLocaleString());
	localforage.setItem('namesUndoRedo',namesUndoRedo);
	localforage.setItem('allDataBefore',allDataBefore);
	localStorage.setItem('namesUndoRedoLg',namesUndoRedo.length);
	$('undoredoDiv').style.display='none';
resetAllfunc()
}
function resetAllfunc(){txHistIns=0;
	resetHcolor();myResetFunction();formKalei(1,0);resetAllCSS();
	thumbnailClick('data/aaa.jpg',0,[1024,1024,'aaa.jpg',777,0],18);txHistIns=1;
}
function showNames(){var up=UndoRedoPos,nl=namesUndoRedo.length;
$('undoText').disabled=up<2?1:0;
$('undoredo').disabled=nl<1?1:0;
$('redoText').disabled=up<nl?0:1;up=up>nl?nl:up<0?0:up;
$('undoredo').innerHTML='⏴ '+(up<10?'0'+up:up)+'('+(nl<10?'0'+nl:nl)+') ⏵';
$('slider9b').innerHTML='Undo and Redo: step '+up+' from '+nl;
}

function undoHist(pp){var his=1;txHistIns=0;
if(UndoRedoPos>namesUndoRedo.length)UndoRedoPos=namesUndoRedo.length;
if(UndoRedoPos>2&&namesUndoRedo[UndoRedoPos-2][1].length>20){
openDesignsSv(namesUndoRedo[UndoRedoPos-2][1]);UndoRedoPos--}else{
for(var i=UndoRedoPos-2;i>=0;i--){if(namesUndoRedo[i][2]==namesUndoRedo[UndoRedoPos-1][2]){
	his=0;setoAppFunc(namesUndoRedo[i],pp);UndoRedoPos--;showNames();txHistIns=1;break;}
}
if(his){setoAppFunc(allDataSe[namesUndoRedo[UndoRedoPos-1][2]-1],pp);UndoRedoPos--;}}
showNames();txHistIns=1;
$('slider9').value=UndoRedoPos;
$('slider9b').innerHTML='Undo and Redo: step '+UndoRedoPos+' from '+namesUndoRedo.length;
}
function redoHist(){
txHistIns=0;UndoRedoPos++;showNames();
if(UndoRedoPos>namesUndoRedo.length)UndoRedoPos=namesUndoRedo.length;
namesUndoRedo[UndoRedoPos-1][1].length>20?
openDesignsSv(namesUndoRedo[UndoRedoPos-1][1]):
setoAppFunc(namesUndoRedo[UndoRedoPos-1],0);txHistIns=1;
$('slider9').value=UndoRedoPos;
$('slider9b').innerHTML='Undo and Redo: step '+UndoRedoPos+' from '+namesUndoRedo.length;
}

var allDataSe=[[1,0,1],[1,0,2],[2,0.4,3],[3,12,4],[1,1,5],[2,1,6],[3,1,7],[4,0,8],[5,0,9],[1,0,10],[2,0,11],[3,[0,0,0],12],[2,'transparent',13],[3,0,14],[700,700,15],[0,['','#0000ff','#ffff00','Arial',48,'','middle'],16],[0.3,0.45,17],['data/aaa.jpg',[1024,1024,'aaa.jpg',777,0],18],[1,0,19],[2,0,20],[3,0,21],[4,0,22],[1,0,23]],
allDataBefore=[[1,0,1],[1,0,2],[2,0.4,3],[3,12,4],[1,1,5],[2,1,6],[3,1,7],[4,0,8],[5,0,9],[1,0,10],[2,0,11],[3,[0,0,0],12],[2,'transparent',13],[3,0,14],[700,700,15],[0,['','#0000ff','#ffff00','Arial',48,'','middle'],16],[0.3,0.45,17],['data/aaa.jpg',[1024,1024,'aaa.jpg',777,0],18],[1,0,19],[2,0,20],[3,0,21],[4,0,22],[1,0,23]];
function saveAppToDb(a,b,c){if(txHistIns&&c<24){var abc=[a,b,c],imh=1;
	if(JSON.stringify(abc)!=JSON.stringify(namesUndoRedo[namesUndoRedo.length-1])){
	if(UndoRedoPos==0&&namesUndoRedo.length>1){UndoRedoPos=1;namesUndoRedo=[copyArray(allDataSe[(allDataSe.length-1)])];}
	else if(UndoRedoPos<namesUndoRedo.length){
		if(abc[2]!=23){allDataBefore=setAppMoment();}
		namesUndoRedo.splice(UndoRedoPos-1,namesUndoRedo.length-1);}
	if(UndoRedoPos>namesUndoRedo.length)UndoRedoPos=namesUndoRedo.length;
	if(abc[2]==23){namesUndoRedo[namesUndoRedo.length-1]=[1,copyArray(allDataBefore),23];allDataBefore=copyArray(abc[1]);}else{allDataBefore[abc[2]-1]=abc;}	
	namesUndoRedo.push(abc);UndoRedoPos++;showNames();
	if(namesUndoRedo.length>3){var date=new Date();
	localforage.setItem('UndoRedoPos',UndoRedoPos);
	localforage.setItem('UndoRedoDate',date.toLocaleString());
	localforage.setItem('namesUndoRedo',namesUndoRedo);
	localforage.setItem('allDataBefore',allDataBefore);
	localStorage.setItem('namesUndoRedoLg',namesUndoRedo.length);
	}
}}}

$('undoText').addEventListener('click',undoHist);
$('redoText').addEventListener('click',redoHist);

function setSavedHist(){var myAr;txHistIns=0;
localforage.getItem('UndoRedoPos').then((val)=>{myAr=val||0;UndoRedoPos=myAr;
localforage.getItem('allDataBefore').then((val)=>{myAr=val||[];allDataBefore=myAr;
localforage.getItem('namesUndoRedo').then((val)=>{myAr=val||[];namesUndoRedo=myAr;
txHistIns=0;showNames();
for(var i=1;i<namesUndoRedo.length;i++){var abc=namesUndoRedo[i];
	if(abc[2]==16&&fontplus.indexOf(abc[1][3])>-1){setNewFonts();}
	if(abc[2]==18&&abc[1][3]!=777)addImageToImagesUL($('imagesNew'),abc[0],abc[1]);
	}openDesignsSv(allDataBefore);
txHistIns=1});});});
}
function slider9inpv(){this.value<UndoRedoPos?undoHist():redoHist()}

function undoredoHist(){closeAPosDiv();
var up=UndoRedoPos,nl=namesUndoRedo.length;
$('slider9').max=nl;$('slider9').value=up;
$('slider9b').innerHTML='Undo and Redo: step '+up+' from '+nl;
$('slider9').addEventListener('input',slider9inpv);
$('undoredoDiv').style.display='block';
}

function openDesignsSv(d){if(Array.isArray(d)){txHistIns=0;
for(var i=0;i<18;i++){setoAppFunc(d[i],1);}setoAppFunc(d[0],1);txHistIns=1;}
}

function infoSavedHist(){
localforage.getItem('UndoRedoDate').then((val)=>{
	if(val!=''){
var tx='<p>A stored version of a kaleidoscope found and loaded:</p><p id="stored-version">Kaleidoscope from '+val+'</p><p><button id="infoSavedCl" onclick="$(\'startupHelp\').style.display=\'none\';return false">CLOSE</button></p><p id="designs-version"></p>';
$('startupHelp').innerHTML=tx;
var mx=($('kaleidoCanvas').clientWidth-10)+'px',mh='200px';
$('startupHelp').setAttribute('style','max-width:'+mx+';max-height:'+mh+';');
setSavedHist()}})
}

function closeAPosDiv(){$('ownDesignsDiv').style.display='none';
$('allImages').style.display='none';$('undoredoDiv').style.display='none';
}

function designsSel(){ownDesiseAct=ownDesiseAct==0?1:0;
$('designsul').style.background=ownDesiseAct==0?'none':'#f5ed7f';
$('helpselect').style.display=ownDesiseAct==0?'none':'block';
$('designsSDel').disabled=true;
if(ownDesiseAct==0){ownDesisel=[];
for(var i=0;i<ownDesigns.length;i++){$('designss'+i).style.background='none'}}
}

function designsSDel(){if(ownDesiseAct&&ownDesisel.length>0){
for(var i=0;i<ownDesisel.length;i++){ownDesigns.splice(ownDesisel[i],1)}
localforage.setItem('ownDesigns',ownDesigns);allDesigns(0);
$('designsSDel').disabled=true;ownDesiseAct=0;
$('designsul').style.background='none';
if(navigator.setAppBadge){navigator.setAppBadge(ownDesigns.length);
if(ownDesigns.length==0)navigator.clearAppBadge()}
$('ownDesignsbt').innerHTML='Own Designs<k class="appbadge">'+ownDesigns.length+'</k>';
}}

function designsAllDel(){ownDesigns=[];
localforage.setItem('ownDesigns','');
localStorage.setItem('ownDesigns','');
$('designsSDel').disabled=true;
$('ownDesignsbt').disabled=true;closeAPosDiv();
if(navigator.setAppBadge){navigator.clearAppBadge()}
$('ownDesignsbt').innerHTML='Own Designs<k class="appbadge">0</k>';
}


function openDesigns(dd){if(ownDesiseAct){var set=ownDesisel.indexOf(dd)>-1?1:0;
$('designss'+dd).style.background=set?'none':'red';
set?ownDesisel.splice(ownDesisel.indexOf(dd),1):ownDesisel.push(dd);
$('designsSDel').disabled=ownDesisel.length>0?false:true;
}else{var d=ownDesigns[dd];txHistIns=0;
for(var i=0;i<18;i++){setoAppFunc(d[i],1);}setoAppFunc(d[0],1);
txHistIns=1;saveAppToDb(1,d,23)}
}

function allDesigns(ems){closeAPosDiv();ownDesisel=[];ownDesiseAct=0;
localforage.getItem('ownDesigns').then((val)=>{
var html='<b><p>Own saved Designs<k class="appbadge">'+ownDesigns.length+'</k><button id="ownDesiCl" onclick="closeAPosDiv();return false">X</button></p>Click on design to load and edit<ul id="designsul">';
if(ems){ownDesigns=copyArray(val);
$('designs-version').innerHTML=val.length+' Kaleidoscope-Desingns loaded<k class="appbadge">'+val.length+'</k>. Click "Own Designs" to view and load saved design.'}
if(ownDesigns.length>0){$('ownDesignsbt').disabled=false;
$('ownDesignsbt').innerHTML='Own Designs<k class="appbadge">'+ownDesigns.length+'</k>';
if(navigator.setAppBadge){navigator.setAppBadge(ownDesigns.length);}
for(var i=0;i<ownDesigns.length;i++){var abc=ownDesigns[i];
html+='<li id="designss'+i+'" onclick="openDesigns('+i+')"><img src="'+abc[22][1]+'"><br><em>'+abc[22][0]+'</em></li>';
if(ems&&abc[17][2]==18&&abc[17][1][3]!=777)addImageToImagesUL($('imagesNew'),abc[17][0],abc[17][1]);
if(ems&&abc[15][2]==16&&fontplus.indexOf(abc[15][1][3])>-1){setNewFonts();}
}
$('ownDesignsDiv').innerHTML=html+'</ul><p id="helpselect">Click on design to select</p><p><button id="designsSel" onclick="designsSel();return false">Select</button> <button id="designsSDel" onclick="designsSDel();return false" disabled>Delete selected Designs</button> <button id="designsAllDel" onclick="designsAllDel();return false">Delete all Designs</button></p><button id="ownDesignsCl" onclick="closeAPosDiv();return false">CLOSE</button></b>'}});
if(!ems)$('ownDesignsDiv').style.display='block';
}
function addDesign(){
$('addDesignVi').innerHTML='';
$('addDesignVi').style.padding='9px';
$('addDesignVi').style.opacity=1;$('addDesignVi').style.maxWidth='140px';
var all=setAppMoment(),c=document.createElement('canvas'),
g=c.getContext('2d',{willReadFrequently:true}),imm=document.createElement('img');
c.width=canvasWidthHeight[0];c.height=canvasWidthHeight[1];
g.fillStyle='#ffffff';g.rect(0,0,c.width,c.height);g.fill();
g.drawImage(canvas,0,0);g.drawImage(canvastx,0,0);
var w=70*c.width/c.height,h=70;
var her=new Hermite_class();her.resample(c,w,h,true,function(){
var im=c.toDataURL('image/jpeg',0.6),date=new Date(),tx=date.toLocaleString().replace('202','2').replace(' ','').replace('-','.');
imm.width=140;imm.height=140*c.height/c.width;imm.src=im;$('addDesignVi').appendChild(imm);$('addDesignVi').innerHTML+=('<br>'+tx);
all[22]=[tx,im,23];ownDesigns.push(all);
if(navigator.setAppBadge){navigator.setAppBadge(ownDesigns.length);}
$('ownDesignsbt').innerHTML='Own Designs<k class="appbadge">'+ownDesigns.length+'</k>';
localforage.setItem('ownDesigns',ownDesigns);
localStorage.setItem('ownDesigns','set');
setTimeout(function(){$('addDesignVi').style.opacity=0;$('addDesignVi').style.padding='0';
$('addDesignVi').style.maxWidth=0;$('ownDesignsbt').disabled=false;},2500);})
}

if(localStorage.getItem('namesUndoRedoLg')&&localStorage.getItem('namesUndoRedoLg')>3){infoSavedHist()}
if(localStorage.getItem('ownDesigns')&&localStorage.getItem('ownDesigns')=='set'){allDesigns(1)}

const populateFontSelect = async (e) => {   
		try{const fonts={};
      const styleSheet=new CSSStyleSheet();
        const pickedFonts=await queryLocalFonts();
        for(const metadata of pickedFonts){
          if(!fonts[metadata.family]){fonts[metadata.family]=[];}
          fonts[metadata.family].push(metadata);
        }
	const fontSel=$('gifFonts');
	fontSel.innerHTML='';
	  const opt=document.createElement('option');
      opt.text='Font';
      opt.value='arial';
	opt.style='font-family:Arial;background:#0dccea';
		fontSel.append(opt);
      Object.keys(fonts)
        .sort()
        .forEach((fontFamily, index) => {
          fonts[fontFamily]
            .forEach((font) => {var fo=font.fullName.replace(' Normal',''),fontna='\''+fo+'\'',
			  pattern = /bold|kursiv|negret|fed|oblik|cursiv|italic|semili|semico/i;
					if(!pattern.test(fontna)){
			  const detailsLi=document.createElement('option');
              detailsLi.style.fontFamily = fontna;
              detailsLi.value = fontna;
              detailsLi.text = font.fullName;
              fontSel.append(detailsLi);
              styleSheet.insertRule(`
                @font-face {
                  font-family: '${font.fullName}';
                  src: local('${font.fullName}'),
                      local('${font.postscriptName}');
                }`);}
            });
        });
			var opti = $('gifFonts').length;
			if (opti > 10) $('fonstload').innerHTML = opti +' local Fonts loaded'
			}catch(er){
			const status = await navigator.permissions.query({ name: "local-fonts" });
			if (status.state === "granted")
				console.log("permission was granted 👍");
			else if (status.state === "prompt")
				$('fonstload').innerHTML = 'Local Fonts: permission will be requested';
			else
				$('fonstload').innerHTML = 'Local Fonts: permission was denied';
				}
};
								   
if('queryLocalFonts' in window){populateFontSelect()}

function testHColor(c){var reg=/^#([0-9a-f]{3}){1,2}$/i;return reg.test(c);}

function imageTrEyed(){
	const eyeDropper = new EyeDropper();
	eyeDropper.open().then((result) => {
		var c=result.sRGBHex;
		if(testHColor(c)){$('setRemColor').value=c;valueTransp();
		saveAppToDb(3,hexToRgb($('setRemColor').value),12)}
	  }).catch((e) => {});
}
function imageBgEyed(){
	const eyeDropper = new EyeDropper();
	eyeDropper.open().then((result) => {
		var c=result.sRGBHex;
		if(testHColor(c)){$('setHcolor').value=c;
		writeHcolorSe($('setHcolor').value);
		saveAppToDb(3,$('setHcolor').value,13)}
  }).catch((e) => {});
}
function imageTxiEyed(){
	const eyeDropper = new EyeDropper();
	eyeDropper.open().then((result) => {
		var c=result.sRGBHex;
		if(testHColor(c)){$('gifTxColor').value=c;
		gifShareSet1();textCanvasGp()}
	  }).catch((e) => {});
}
function imageTxaEyed(){
	const eyeDropper = new EyeDropper();
	eyeDropper.open().then((result) => {
		var c=result.sRGBHex;
		if(testHColor(c)){$('gifTxColor2').value=c;
		gifShareSet2();textCanvasGp()}
	  }).catch((e) => {});
}
if ('EyeDropper' in window) {
    // EyeDropper supported
}
else {$('imageTrEye').style.display='none';
$('imageBgEye').style.display='none';
$('imageTxiEye').style.display='none';
$('imageTxaEye').style.display='none';}