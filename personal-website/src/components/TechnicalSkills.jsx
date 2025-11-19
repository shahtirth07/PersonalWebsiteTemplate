import React from 'react';
import './TechnicalSkills.css';
import reactLogo from '../assets/react.svg';
import githubLogo from '../assets/github.png';
import pythonLogo from '../assets/python.svg';
import javascriptLogo from '../assets/javascript.svg';
import typescriptLogo from '../assets/typescript.svg';
import javaLogo from '../assets/java.svg';
import cppLogo from '../assets/cplusplus.svg';
import kotlinLogo from '../assets/kotlin.svg';
import dockerLogo from '../assets/docker.svg';
import gitLogo from '../assets/git.svg';
import nodeLogo from '../assets/node.svg';
import mongodbLogo from '../assets/mongodb.svg';
import kubernetesLogo from '../assets/kubernetes.svg';
import springbootLogo from '../assets/springboot.svg';
import groovyLogo from '../assets/groovy.svg';
import scalaLogo from '../assets/scala.svg';
import html5Logo from '../assets/html5.svg';
import css3Logo from '../assets/css3.svg';
import xmlLogo from '../assets/xml.svg';
import mysqlLogo from '../assets/mysql.svg';
import csharpLogo from '../assets/csharp.svg';
import dartLogo from '../assets/dart.svg';
import nuxtjsLogo from '../assets/nuxtjs.svg';
import vuejsLogo from '../assets/vuejs.svg';
import tensorflowLogo from '../assets/tensorflow.svg';
import numpyLogo from '../assets/numpy.svg';
import pandasLogo from '../assets/pandas.svg';
import scikitlearnLogo from '../assets/scikitlearn.svg';
import pytorchLogo from '../assets/pytorch.svg';
import nextjsLogo from '../assets/nextjs.svg';
import angularjsLogo from '../assets/angularjs.svg';
import flaskLogo from '../assets/flask.svg';
import djangoLogo from '../assets/django.svg';
import flutterLogo from '../assets/flutter.svg';
import reactnativeLogo from '../assets/reactnative.svg';
import vscodeLogo from '../assets/vscode.svg';
import gitlabLogo from '../assets/gitlab.svg';
import intellijLogo from '../assets/intellij.svg';
import postmanLogo from '../assets/postman.svg';
import awsLogo from '../assets/aws.svg';
import gcpLogo from '../assets/gcp.svg';
import githubactionsLogo from '../assets/githubactions.svg';
import bigqueryLogo from '../assets/bigquery.svg';
import teradataLogo from '../assets/teradata.svg';
import oracleLogo from '../assets/oracle.svg';
import apiLogo from '../assets/api.svg';
// awsLogo skipped due to download issue

const skillLogos = {
  Python: pythonLogo,
  JavaScript: javascriptLogo,
  TypeScript: typescriptLogo,
  Java: javaLogo,
  'C/C++': cppLogo,
  Kotlin: kotlinLogo,
  Docker: dockerLogo,
  Git: gitLogo,
  Github: githubLogo,
  Nodejs: nodeLogo,
  MongoDb: mongodbLogo,
  Kubernetes: kubernetesLogo,
  Springboot: springbootLogo,
  Reactjs: reactLogo,
  Groovy: groovyLogo,
  Scala: scalaLogo,
  'HTML+CSS': html5Logo, // or use both html5Logo and css3Logo if you want to show both
  XML: xmlLogo,
  MYSQL: mysqlLogo,
  'C#': csharpLogo,
  Dart: dartLogo,
  Nuxtjs: nuxtjsLogo,
  Vuejs: vuejsLogo,
  Lombok: javaLogo,
  Tensorflow: tensorflowLogo,
  Numpy: numpyLogo,
  Pandas: pandasLogo,
  'Scikit learn': scikitlearnLogo,
  Pytorch: pytorchLogo,
  'Next.js': nextjsLogo,
  AngularJS: angularjsLogo,
  Flask: flaskLogo,
  Django: djangoLogo,
  Flutter: flutterLogo,
  'React Native': reactnativeLogo,
  VSCode: vscodeLogo,
  Gitlab: gitlabLogo,
  'IntelliJ Idea': intellijLogo,
  Postman: postmanLogo,
  AWS: awsLogo,
  GCP: gcpLogo,
  'Github Actions': githubactionsLogo,
  BigQuery: bigqueryLogo,
  Teradata: teradataLogo,
  Oracle: oracleLogo,
  RestAPIs: apiLogo,
  'Rest APIs': apiLogo,
  GoogleCloud: gcpLogo,
  'C++ STL': cppLogo,
  JPA: javaLogo,
  // Add more mappings as you add SVGs
};

const skills = [
  {
    category: 'Languages',
    items: [
      'C/C++', 'Java', 'Groovy', 'Python', 'Rust', 'PL/SQL', 'JavaScript', 'C', 'MATLAB', 'Swift', 'Scala', 'Kotlin', 'Flutter', 'TypeScript', 'Dart'
    ]
  },
  {
    category: 'Technologies & Frameworks',
    items: [
      'Git', 'FastAPI', 'Reactjs', 'Rest APIs', 'Nodejs', 'Bootstrap', 'HTML+CSS', 'Tableau', 'Alteryx', 'AWS', 'Docker', 'Kubernetes', 'PySpark', 'Power BI', 'Postman', 'GCP', 'Springboot', 'Microservices', 'Next.js', 'Flask'
    ]
  },
  {
    category: 'Databases',
    items: [
      'MYSQL', 'MongoDb', 'Chroma', 'Firebase', 'PostgreSQL', 'Redis', 'GraphQL', 'Neo4j', 'Supabase'
    ]
  },
  {
    category: 'Machine Learning',
    items: [
      'CUDA', 'Numpy', 'Pandas', 'Transformers', 'Scikit learn', 'Matplotlib', 'Seaborn', 'Pytorch', 'Tensorflow', 'NLTK', 'boto3', 'SciPy', 'BeautifulSoup', 'NLP', 'Deep Learning', 'LangFlow', 'Requests', 'Pillow', 'LangChain', 'FAISS'
    ]
  }
];

const TechnicalSkills = () => (
  <section id="skills" className="skills-section">
    <h2 className="skills-title">Technical Skills</h2>
    <div className="skills-list">
      {skills.map((group, idx) => (
        <div className="skills-group" key={idx}>
          <div className="skills-category">{group.category}</div>
          <div className="skills-tags">
            {group.items.map((item, i) => (
              <span className="skill-tag" key={i}>
                {skillLogos[item] ? (
                  <img src={skillLogos[item]} alt={item + ' logo'} className="skill-logo" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="#23283a" /></svg>
                )}
                <span className="skill-text">{item}</span>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default TechnicalSkills; 