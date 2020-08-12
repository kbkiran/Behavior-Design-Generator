import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {saveAs as importedSaveAs} from "file-saver";

@Component({
  selector: 'app-design-info',
  templateUrl: './design-info.component.html',
  styleUrls: ['./design-info.component.css']
})
export class DesignInfoComponent implements OnInit {
  testCaseForm: FormGroup;
  fileTypes = ['XML', 'JSON'];
  disableExportButton: boolean = true;
  options: any[] = [
    { value: 'Given', viewValue: 'Given' },
    { value: 'And', viewValue: 'And' },
    { value: 'When', viewValue: 'When' },
    { value: 'Then', viewValue: 'Then' }
  ];
  actions: any[] = [
    { value: '', viewValue: '' }, 
    { value: 'Click', viewValue: 'Click' },
    { value: 'Select', viewValue: 'Select' },
    { value: 'Enter', viewValue: 'Enter' },
    { value: 'Navigate', viewValue: 'Navigate' }
  ];

  constructor(private fb: FormBuilder, private http: HttpClient) { }

  logToConsole(object: any) {
    console.log(object);
  }

  ngOnInit() {
    this.testCaseForm = this.fb.group({
      fileType: '',
      testScenarios: this.fb.array([this.testScenarios])
    });
  }

  get testScenarios(): FormGroup {
    return this.fb.group({
      generatedText: '',
      testScenario: this.fb.array([this.testScenario])
    });
  }

  get testScenario(): FormGroup {
    return this.fb.group({
      predicate: '',
      action: '',
      scenario: '',
    });
  }

  addTestCase() {
    (this.testCaseForm.get("testScenarios") as FormArray).push(this.testScenarios);
  }

  deleteTestCase(index) {
    var testScenariosArray:FormArray=(this.testCaseForm.get("testScenarios") as FormArray) ;
    testScenariosArray.removeAt(index);
    if(testScenariosArray.length==0){
      this.disableExportButton = true;
    }
  }

  addRow(testCase) {
    testCase.get("testScenario").push(this.testScenario);
  }

  deleteRow(testCase, index) {
    testCase.get("testScenario").removeAt(index);
  }

  reset() {
    this.disableExportButton = true;
    while ((this.testCaseForm.get("testScenarios") as FormArray).length !== 0) {
      (this.testCaseForm.get("testScenarios") as FormArray).removeAt(0)
    }
  }

  generateText(index) {
    let generatedText = '';
    let separator='.........................';
    let formData = (<FormArray>this.testCaseForm.get('testScenarios')).at(index);
    formData.value.testScenario.forEach(element => {
      if (element.predicate && element.scenario) {
        this.disableExportButton = false;
        generatedText = generatedText.concat(
          this.addPadding(element.predicate,'predicate') + separator+
          this.addPadding(element.action,'action') +separator+
          element.scenario+"\n");
      }
    });
    formData.get('generatedText').setValue(generatedText);
  }
  addPadding(fieldValue: string, type: string) {
    if (type === 'predicate') {
      return this.performPadding(fieldValue,5);
    } 
    return this.performPadding(fieldValue,8);
  }
  performPadding(fieldValue: string, fieldMaxLength: number) {
    let padding = fieldMaxLength - fieldValue.length;
    for (let index = 0; index < padding; index++) {
      fieldValue = fieldValue + " ";
    }
    return fieldValue;
  }

  exportData() {
    let requestObject = this.testCaseForm.value;
    delete requestObject.fileType;
    requestObject.testScenarios.forEach(scenario => {
      delete scenario.generatedText;
    })
    let fileType=(this.testCaseForm.get('fileType').value).toLowerCase()
    let fileName='';
    if(fileType === 'json'){
      fileName = 'BDDScenarios.json'
    }
    if(fileType === 'xml'){
      fileName = 'BDDScenarios.xml'
    }
    const url = 'http://localhost:9090/convertData/' + fileType;
    return this.http.post(url, requestObject,{responseType: 'blob'}).subscribe(data => {
      //console.log(data); 
      importedSaveAs(data, fileName)
    });
  }
}
