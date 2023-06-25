import {Component, Input, OnInit} from '@angular/core';
import {Project} from "../../common/models/project";
import {HttpsRequestService} from "../../service/https-request.service";
import {BuildingLocation} from "../../common/models/buildingLocation";
import {OrchestratorEventName} from "../../orchestrator-service/models/orchestrator-event-name";
import {
  OrchestratorCommunicationService
} from "../../orchestrator-service/orchestrartor-communication/orchestrator-communication.service";

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit{
  showPartInfo: boolean = true;
  projectCommonLocationList!: BuildingLocation[];
  projectBuildings!: Project[];
  buildingLocation!: BuildingLocation;
  @Input() projectInfo!: Project;
  constructor(private httpsRequestService:HttpsRequestService,
              private orchestratorCommunicationService: OrchestratorCommunicationService) {
    this.subscribeToProjectUpdatedEvent();
  }
  ngOnInit(): void {
    let url = 'https://deckinspectors-dev.azurewebsites.net/api/location/getLocationsByProjectId';
    let data = {
      projectid:this.projectInfo._id,
      username: 'deck'
    };
    this.httpsRequestService.postHttpData(url, data).subscribe(
      (response:any) => {
        this.projectCommonLocationList = response.item;
      },
      error => {
        console.log(error)
      }
    );

    url = 'https://deckinspectors-dev.azurewebsites.net/api/subproject/getSubprojectsDataByProjectId';
    data = {
      projectid:this.projectInfo._id,
      username: 'deck'
    };
    this.httpsRequestService.postHttpData(url, data).subscribe(
      (response:any) => {
        this.projectBuildings = response.item;
      },
      error => {
        console.log(error)
      }
    );
  }
  public gotoPartInfo($event: BuildingLocation): void {
    this.showPartInfo = false;
    this.buildingLocation = $event;
   }

  private subscribeToProjectUpdatedEvent() {
    this.orchestratorCommunicationService.getSubscription(OrchestratorEventName.Application_State_change).subscribe(data => {
      console.log(data);
    })
  }
}
