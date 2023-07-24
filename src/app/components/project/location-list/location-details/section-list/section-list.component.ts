import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {
  VisualDeckReportModalComponent
} from "../../../../../forms/visual-deck-report-modal/visual-deck-report-modal.component";
import {BuildingLocation, Section} from "../../../../../common/models/buildingLocation";
import {
  OrchestratorCommunicationService
} from "../../../../../orchestrator-service/orchestrartor-communication/orchestrator-communication.service";
import {HttpsRequestService} from "../../../../../service/https-request.service";
import {OrchestratorEventName} from "../../../../../orchestrator-service/models/orchestrator-event-name";
import {ProjectQuery} from "../../../../../app-state-service/project-state/project-selector";
import {Store} from "@ngrx/store";
import {ProjectState} from "../../../../../app-state-service/store/project-state-model";

@Component({
  selector: 'app-section-list',
  templateUrl: './section-list.component.html',
  styleUrls: ['./section-list.component.scss'],
})
export class SectionListComponent implements OnInit{
  header: string = 'Locations';
  @Output() sectionID = new EventEmitter<string>();
  location_!: BuildingLocation;  // @Input() location!: BuildingLocation
  sections: Section[] = [];
  @Input()
  set location(location: BuildingLocation) {
    this.location_ = location;
    this.getSections(location);

  }
  public currentSection!: any;

  projectState!: ProjectState;

  constructor(private dialog: MatDialog,
              private orchestratorCommunicationService:OrchestratorCommunicationService,
              private httpsRequestService:HttpsRequestService,
              private store: Store<any>) {
  }
  openVisualDeckReportModal() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "600px";
    dialogConfig.height = "700px";
    dialogConfig.data = {
      id: 1
    };
    const dialogRef = this.dialog.open(VisualDeckReportModalComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(data => {
      this.createSection(data);
    })
  }

  fetchDataForGivenSectionId($event: Section) {
    this.sectionID.emit($event._id);
    this.currentSection = $event;
    console.log($event);
  }

  ngOnInit(): void {
    this.subscribeProjectState();
  }

  private createSection(data: any) {
    let request = {
      "name": data.visualReportName,
      "additionalconsiderations": data.additionalConsiderationsOrConcern,
      "awe": data.AWE,
      "conditionalassessment": data.conditionAssessment,
      "createdby": "deck",
      "eee": data.EEE,
      "exteriorelements": data.exteriorElements,
      "furtherinvasivereviewrequired": data.invasiveReviewRequired,
      "lbc": data.LBC,
      "parentid":this.location._id,
      "parenttype": this.location.type,
      "visualreview": data.visualReview,
      "visualsignsofleak": data.signsOfLeaks,
      "waterproofingelements": data.waterproofingElements,
      "images": data.images
    }
    let url = 'https://deckinspectors-dev.azurewebsites.net/api/section/add';
    // console.log(request);
    this.httpsRequestService.postHttpData(url, request).subscribe(
      (response:any) => {
        // console.log(response);
        this.orchestratorCommunicationService.publishEvent(OrchestratorEventName.UPDATE_LEFT_TREE_DATA, 'added section');
      },
      error => {
        console.log(error)
      }
    );
  }

  private subscribeProjectState() {
    this.store.select(ProjectQuery.getProjectModel).subscribe(data => {
      this.projectState = data.state;
    });
  }

  private getSections(location: BuildingLocation) {
    if (this.projectState === ProjectState.INVASIVE) {
      this.sections = location.invasiveSections;
    } else {
      this.sections = location.sections;
    }

  }
}
