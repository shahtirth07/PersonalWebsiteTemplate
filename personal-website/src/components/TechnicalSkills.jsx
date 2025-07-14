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
  // Add more mappings as you add SVGs
};

const skills = [
  {
    category: 'Languages',
    items: [
      'C/C++', 'Python', 'Java', 'Kotlin', 'Groovy', 'Scala', 'JavaScript', 'HTML+CSS', 'TypeScript', 'XML', 'MYSQL', 'C#', 'SQL (Postgres, MySQL)', 'NoSQL (Firebase, MongoDB)', 'Dart'
    ]
  },
  {
    category: 'Frameworks & Libraries',
    items: [
      'Springboot', 'Nodejs', 'Nuxtjs', 'Reactjs', 'Vuejs', 'Lombok', '.NET', 'C++ STL', 'Tensorflow', 'Numpy', 'Pandas', 'JPA', 'Scikit learn', 'Pytorch', 'Next.js', 'AngularJS', 'Flask', 'Django', 'Flutter', 'React Native'
    ]
  },
  {
    category: 'DevOps & Tools',
    items: [
      'Nodejs', 'VSCode', 'Git', 'Github', 'Gitlab', 'IntelliJ Idea', 'Docker', 'Kubernetes', 'Rest APIs', 'Postman', 'AWS', 'GCP', 'Github Actions', 'Relational Database(MySQL)', 'BigQuery', 'Teradata', 'Oracle', 'MongoDb', 'GoogleCloud'
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