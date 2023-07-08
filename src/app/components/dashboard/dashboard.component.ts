import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {HttpsRequestService} from "../../service/https-request.service";
import {Project} from "../../common/models/project";
import {
  OrchestratorCommunicationService
} from "../../orchestrator-service/orchestrartor-communication/orchestrator-communication.service";
import {OrchestratorEventName} from "../../orchestrator-service/models/orchestrator-event-name";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit
{
  showProjectInfo: boolean = true;
  projectInfo! : Project;
  projectInfos!: Project[];
  allProjects!: Project[];
    constructor(private cdr: ChangeDetectorRef,
                private httpsRequestService:HttpsRequestService,
                private orchestratorCommunicationService:OrchestratorCommunicationService) {}

    ngOnInit(): void {
      this.fetchProjectData();
      this.subscribeToshowProjectInfoToggle();
    }


  private fetchProjectData() {
    this.httpsRequestService.getHttpData<any>('https://deckinspectors-dev.azurewebsites.net/api/project/getProjectsByUser/deck').subscribe(
      (data) => {
        this.projectInfos = data.projects;
        this.allProjects = data.projects;
      },
      error => {
        console.log(error);
      }
    )
  }

  public gotoProject(projectInfo :Project): void {
    this.showProjectInfo = false;
    this.projectInfo = projectInfo;
    this.orchestratorCommunicationService.publishEvent(OrchestratorEventName.Project_update,projectInfo);
  }

  private subscribeToshowProjectInfoToggle() {
      // Show Project Screen
    this.orchestratorCommunicationService.getSubscription(OrchestratorEventName.Show_All_Projects).subscribe(data => {
      this.showProjectInfo = data;
    })
  }

  projectSearch($event: string) {
    this.projectInfos = this.allProjects.filter((project) =>
      project.name.toLowerCase().includes($event.toLowerCase())
    );
  }

  newProjectUploaded() {
      // add Timeout
      setTimeout(() => {
        this.fetchProjectData();
      },1000)
  }
}
