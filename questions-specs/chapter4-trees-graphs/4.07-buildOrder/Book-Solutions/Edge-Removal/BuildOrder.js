'use strict';

import Graph from './Graph';
import Project from './Project';

export class BuildOrder {
  constructor() {
    this.graph = new Graph();
  }

	buildGraph(projects, dependencies) {
		for (const project of projects) {
			this.graph.getOrCreateNode(project);
		}

		for (const dependency of dependencies) {
			this.graph.addEdge(dependency[0], dependency[1]);
		}

		return this.graph;
	}

  addNonDependent(order, projects, offset) {
		for (const project of projects) {
			if (project[1].getNumberDependencies() === 0) {
				order[offset] = project;
				offset++;
			}
		}
		return offset;
	}

  orderProjects(projects) {
		const order = new Array(projects.size);

		/* Add “roots” to the build order first.*/
		let endOfList = this.addNonDependent(order, projects, 0);

		let toBeProcessed = 0;
		while (toBeProcessed < order.length) {
			const current = order[toBeProcessed];

			/* We have a circular dependency since there are no remaining
			 * projects with zero dependencies. */
			if (current === null) return null;

			/* Remove myself as a dependency. */
			const children = current[1].getChildren();
			for (const child of children) {
				child[1].decrementDependencies();
			}

			/* Add children that have no one depending on them. */
			endOfList = this.addNonDependent(order, children, endOfList);

			toBeProcessed++;
		}

		return order;
	}

  convertToArray(projects) {
    projects = [...projects];
    const length = projects.length;
    const buildOrder = new Array(length);
    // console.log(projects);
		for (let i = 0; i < length; i++) {
			buildOrder[i] = projects[i][1].getName();
		}
    // console.log([...projects]);
		return buildOrder;
    // projects.forEach((project, i) => {
    //   // console.log(project, i);
    //   buildOrder[i] = project[1].getName();
    // });

    // return buildOrder;
	}

  findBuildOrder(projects, dependencies) {
		const graph = this.buildGraph(projects, dependencies);
		return this.orderProjects(graph.getNodes());
	}

	buildOrderWrapper(projects, dependencies) {
		const buildOrder = this.findBuildOrder(projects, dependencies);
		if (buildOrder === null) return null;
		const buildOrderString = this.convertToArray(buildOrder);
		return buildOrderString;
	}

	start(projects, dependencies) {
		const buildOrder = this.buildOrderWrapper(projects, dependencies);
		if (buildOrder === null) {
      throw Error('dependencies are cyclic');
		}
    console.log(buildOrder);
    return buildOrder;
	}

}
