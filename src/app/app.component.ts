import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MatStepper } from '@angular/material/stepper';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
  	trigger(
  		'inAnimation',[
  		transition(
  			':enter',[
  				style({height: 0, opacity: 0 }),
  				animate('1s ease-out', 
                    style({ height: 300, opacity: 1 })
                    )
  			])
  		])
  	]
})
export class AppComponent implements AfterViewInit {
  @ViewChild("mapyCZ", { static: true }) mapa: ElementRef;
  @ViewChild('scrollMe',{static: true, read: ElementRef}) private myScrollContainer: ElementRef;
  // form
  kalkulackaGroup = new FormGroup({
  	building: new FormGroup({
  		q1: new FormControl(null,Validators.required),
  		q2: new FormControl(null,Validators.required),
  		q3: new FormControl(null,Validators.required),
  		q4: new FormControl(null,Validators.required)
  	}),
  	environment: new FormGroup({
  		q1: new FormControl(null,Validators.required),
  		q2: new FormControl(null,Validators.required),
  		q3: new FormControl(null,Validators.required),
  		q4: new FormControl(null,Validators.required),
  		q5: new FormControl(false,Validators.required)
  	})
  })
  // map
  map : any;
  showForm: boolean = false;
  title: string = 'kalkulacka-app';
  // results
  showResults: boolean = false;
  results: any = {
    building: 0,
    environment: 0
  }

  async ngAfterViewInit() {
  	const MapyCZLoader = await getMapyCz();
    // let m;
    MapyCZLoader.async = true;
    MapyCZLoader.load(null, {suggest: true}, () => {
      this.initMap();
    });
    
  }

  onSubmit(): void {
    this.showResults = true;
    setTimeout(() => {
      this.results = {
            building: 25,
            environment: 50
          }
    }, 1000);    
  }

  initMap() {
    const win = window as any;
    const mapaCZ = this.mapa.nativeElement;

    var suggest = new win.SMap.Suggest(document.querySelector("#suggestBox"));
    //console.log(suggest);
    suggest.addListener("suggest", (suggestData: any) => {
      // vyber polozky z naseptavace
      if (suggestData.data) {
        this.map.setCenterZoom(win.SMap.Coords.fromWGS84(suggestData.data.longitude, suggestData.data.latitude),18);
        let marker = new win.SMap.Marker(win.SMap.Coords.fromWGS84(suggestData.data.longitude, suggestData.data.latitude), 'pt');
        this.map._layers[3].removeAll();
        this.map._layers[3].addMarker(marker);
        // add circles
        this.map._layers[4].removeAll();
        var radius = 0.07; /* polomer v km */
        const equator = 6378 * 2 * Math.PI;  /* delka rovniku (km) */
        var yrad = Math.PI * suggestData.data.latitude / 180;      /* zemepisna sirka v radianech */
        var line = equator * Math.cos(yrad); /* delka rovnobezky (km) na ktere lezi stred kruznice */
        var angle = 360*radius / line;
        var point1 = win.SMap.Coords.fromWGS84(suggestData.data.longitude + angle, suggestData.data.latitude);
        var options = {
            color: "#e83e8c",
            opacity: 0.2,
            outlineColor: "#e83e8c",
            outlineOpacity: 0.5,
            outlineWidth: 3
        };
        var circle1 = new win.SMap.Geometry(win.SMap.GEOMETRY_CIRCLE, null, [ win.SMap.Coords.fromWGS84(suggestData.data.longitude, suggestData.data.latitude),point1 ], options);
        this.map._layers[4].addGeometry(circle1);
        // second circle
        var point2 = win.SMap.Coords.fromWGS84(suggestData.data.longitude + angle*10, suggestData.data.latitude);
        var options = {
            color: "#6610f2",
            opacity: 0.1,
            outlineColor: "#6610f2",
            outlineOpacity: 0.5,
            outlineWidth: 3
        };
        var circle2 = new win.SMap.Geometry(win.SMap.GEOMETRY_CIRCLE, null, [ win.SMap.Coords.fromWGS84(suggestData.data.longitude, suggestData.data.latitude),point2 ], options);
        this.map._layers[4].addGeometry(circle2);
        this.showForm = true;
        layers[win.SMap.DEF_OPHOTO].enable();
      }
    })

    let center = win.SMap.Coords.fromWGS84(16, 50);
    const m = new win.SMap(mapaCZ, center, 7);
    var layers: any = {};

    layers[win.SMap.DEF_BASE] = m.addDefaultLayer(win.SMap.DEF_BASE);
    layers[win.SMap.DEF_OPHOTO] = m.addDefaultLayer(win.SMap.DEF_OPHOTO);
    layers[win.SMap.DEF_BASE].enable(); /* pro začátek zapnout základní podklad */
    var mouse = new win.SMap.Control.Mouse(win.SMap.MOUSE_PAN | win.SMap.MOUSE_WHEEL | win.SMap.MOUSE_ZOOM); /* Ovládání myší */
    m.addControl(mouse); 
    m.addDefaultControls();

    let layer = new win.SMap.Layer.Marker();
    let layer2 = new win.SMap.Layer.Geometry();
    m.addLayer(layer);
    m.addLayer(layer2);
    layer.enable();
    layer2.enable();

    /*on click update marker in map*/
    m.getSignals().addListener(window, "map-click", (e: any, elm: any) => { /* Došlo ke kliknutí, spočítáme kde */
      var coords = new win.SMap.Coords.fromEvent(e.data.event, m);
      let marker = new win.SMap.Marker(coords, 'pt');
      layer.removeAll();
      layer.addMarker(marker);
      // update circles
      if (this.map.getZoom() < 12) {
        this.map.setZoom(12);
      }
      this.map._layers[4].removeAll();
        var radius = 0.07; /* polomer v km */
        const equator = 6378 * 2 * Math.PI;  /* delka rovniku (km) */
        var yrad = Math.PI * coords.x / 180;      /* zemepisna sirka v radianech */
        var line = equator * Math.cos(yrad); /* delka rovnobezky (km) na ktere lezi stred kruznice */
        var angle = 360*radius / line;
        var point1 = win.SMap.Coords.fromWGS84(coords.x + angle, coords.y);
        var options = {
            color: "#e83e8c",
            opacity: 0.2,
            outlineColor: "#e83e8c",
            outlineOpacity: 0.5,
            outlineWidth: 3
        };
        var circle1 = new win.SMap.Geometry(win.SMap.GEOMETRY_CIRCLE, null, [ win.SMap.Coords.fromWGS84(coords.x, coords.y),point1 ], options);
        this.map._layers[4].addGeometry(circle1);
        // second circle
        var point2 = win.SMap.Coords.fromWGS84(coords.x + angle*10, coords.y);
        var options = {
            color: "#6610f2",
            opacity: 0.1,
            outlineColor: "#6610f2",
            outlineOpacity: 0.5,
            outlineWidth: 3
        };
        var circle2 = new win.SMap.Geometry(win.SMap.GEOMETRY_CIRCLE, null, [ win.SMap.Coords.fromWGS84(coords.x, coords.y),point2 ], options);
        this.map._layers[4].addGeometry(circle2);
        this.showForm = true;
        layers[win.SMap.DEF_OPHOTO].enable();
    });
    
    this.map = m
  }

  nextStep(stepper: MatStepper) {
    stepper.next();
  }

  gaugeLabel(value: number) : string {
    if (value <= 25) {
      return('Bezpečné');
    } else if (value < 75) {
      return('Rizikové');
    } else {
      return('Nebezpečné')
    }
  }

  gaugeColor(value: number) : string {
    if (value <= 25) {
      return('#CCFF99');
    } else if (value < 75) {
      return('#FF9966');
    } else {
      return('#FF4081')
    }
  }

  /*scrollToBottom(zoom?: number): void {
    try {
    	window.scrollTo({ left: 0, top: this.myScrollContainer.nativeElement.scrollHeight, behavior: 'smooth' });
    } catch(err) {
    	console.log(err);
    }
    if (zoom) {
      this.map.setZoom(zoom);
    }             
  }*/
}

function getMapyCz(): Promise<any> {
  const win = window as any;
  const SMapLoader = win.Loader;
  if (SMapLoader) {
    return Promise.resolve(SMapLoader);
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://api.mapy.cz/loader.js`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    script.onload = () => {
      const SMapLoader2 = win.Loader;
      if (SMapLoader2) {
        resolve(SMapLoader2);
      } else {
        reject("mapy.cz not available");
      }
    };
  });
}