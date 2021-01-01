import * as util from 'util';
/**
 * @enum {number}
 */
export enum ProjectTreeParseAction {
    SENDERS_TO_TAGS,
    TAGS_TO_SENDERS,
    TO_MATERIAL_TREE,
    TAGS_AND_SENDERS
}

/**
 * Representation of all projects in tree view
 * @class ProjectTreeNode
 */
export class ProjectTreeNode {
    name: string;
    tagsAndSenders: any[];
    crumbs: string[];
    children?: ProjectTreeNode[];

    /**
     * Verifies whether the dictionary is empty
     * @param {*} obj - Dictionary object
     * @returns {boolean} whether the dictionary is empty or not
     */
    private static isDictEmpty(obj): boolean {
        return Object.keys(obj).length === 0;
    }

    /**
     * Creates a new ProjectTreeNode object
     * @param {string} name - Name for the ProjectTreeNode object
     * @param {any[]} tagsAndSenders - an Array of tagsAndSenders
     * @param {string[]} crumbs - List of crumbs
     * @returns A new ProjectTreeNode object
     */
    public static createNew(
        name: string,
        tagsAndSenders: any[],
        crumbs: string[]
    ) {
        const obj = new ProjectTreeNode();
        obj.name = name;
        obj.tagsAndSenders = JSON.parse(JSON.stringify(tagsAndSenders));
        obj.crumbs = JSON.parse(JSON.stringify(crumbs));
        obj.children = [];
        return obj;
    }

    /**
     * Verifies whether the obj is an Array
     * @param {*} obj - Input parameter obj of type any
     * @returns {boolean} whether the obj passed is of type Array
     */
    public static isArray(obj): boolean {
        return obj instanceof Array;
    }

    /**
     * Traverse the tree nodes
     * @param {*} obj - Object representing Tree node structure of projects
     * @param {ProjectTreeParseAction} action - ProjectTreeParseAction for the ProjectTreeNode
     * @returns {(ProjectTreeNode[] | any)} List of ProjectTreeNodes
     */
    public static traverseTree(
        obj: any,
        action: ProjectTreeParseAction
    ): ProjectTreeNode[] | any {
        if (action === ProjectTreeParseAction.TO_MATERIAL_TREE) {
            console.log(obj);
            console.log('***************');
            const res = [];
            ProjectTreeNode.recursiveLoad(obj, [], res, action);
            console.log(res);
            console.log(util.inspect(res, false, null, true));
            return res;
        } else if (action === ProjectTreeParseAction.TAGS_TO_SENDERS) {
            const res = {};
            ProjectTreeNode.recursiveLoad(obj, [], res, action);
            console.log(util.inspect(res, false, null, true));
            return res;
        } else if (action === ProjectTreeParseAction.SENDERS_TO_TAGS) {
            const res = {};
            ProjectTreeNode.recursiveLoad(obj, [], res, action);
            console.log(util.inspect(res, false, null, true));
            return res;
        } else if (action === ProjectTreeParseAction.TAGS_AND_SENDERS) {
            const res = [];
            ProjectTreeNode.recursiveLoad(obj, [], res, action);
            console.log(util.inspect(res, false, null, true));
            return res;
        } else {
            throw new Error('action not supported');
        }
    }
    // public static toTree(obj: any) {
    //     obj = JSON.parse(JSON.stringify(obj));
    //
    //     let curObj = obj;
    //     while (! ProjectTreeNode.isEmpty(obj)) {
    //         let crumbs = []
    //
    //     }
    // }

    /**
     * Add a new leaf node to the current node
     * @param {*} treeNodes - current node reference
     * @param {*} newCrumb -  new crumb to refer new leaf node
     * @param {*} prevCrumbs - List of previous crumbs
     * @param {*} tagsAndSenders - tagsAndSenders for the new leaf node
     */
    private static addLeafNode(
        treeNodes,
        newCrumb,
        prevCrumbs,
        tagsAndSenders
    ) {
        let curNode = treeNodes;
        const curCrumbs = [];

        for (const crumb of prevCrumbs) {
            let found = false;
            curCrumbs.push(crumb);
            for (let i = 0; i < curNode.length; ++i) {
                if (curNode[i].name === crumb) {
                    found = true;
                    curNode = curNode[i].children;
                    break;
                }
            }
            if (!found) {
                curNode.push(ProjectTreeNode.createNew(crumb, [], curCrumbs));
                curNode = curNode[curNode.length - 1].children;
            }
        }
        curCrumbs.push(newCrumb);
        curNode.push(
            ProjectTreeNode.createNew(newCrumb, tagsAndSenders, curCrumbs)
        );
    }

    /**
     * update the finalResult for the tagsToSenders
     * @param {*} ar - List of tags
     * @param {*} finalResult - finalResult of available tags
     */
    private static tagsToSenders(ar, finalResult) {
        for (const el of ar) {
            if (!(el.tag in finalResult)) {
                finalResult[el.tag] = {};
            }
            finalResult[el.tag][el.sender] = true;
        }
    }

   /**
     * update the finalResult for the sendersToTags
     * @param {*} ar - List of tags
     * @param {*} finalResult - finalResult of available tags
     */
    private static sendersToTags(ar, finalResult) {
        for (const el of ar) {
            if (!(el.sender in finalResult)) {
                finalResult[el.sender] = {};
            }
            finalResult[el.sender][el.tag] = true;
        }
    }

    /**
     * Update the finalResult based on ar
     * @param {*} ar - List of objects with properties for tags and senders etc
     * @param {*} finalResult - populated list of ar objects passed in
     * @param {*} crumbs - crumbs value
     */
    private static tagsAndSenders(ar, finalResult, crumbs) {
        console.log('hi tagsAndSenders before', ar);
        for (const el of ar) {
            console.log('hi tagsAndSenders');
            finalResult.push({
                sender: el.sender,
                tag: el.tag,
                alerts: el.alerts,
                crumbs: crumbs
            });
        }
    }

    /**
     * Populate project tree nodes
     * @param {*} obj - Object representing Tree node structure of projects
     * @param {string[]} crumbs- crumbs value
     * @param {*} finalResult - populated list of ar objects passed in
     * @param {ProjectTreeParseAction} action - ProjectTreeParseAction for the ProjectTreeNode
     */
    public static recursiveLoad(
        obj: any,
        crumbs: string[],
        finalResult: any,
        action: ProjectTreeParseAction
    ) {
        if (ProjectTreeNode.isArray(obj)) {
            if (action === ProjectTreeParseAction.TO_MATERIAL_TREE) {
                throw new Error('invalid state');
                // ProjectTreeNode.addLeafNode(finalResult, key, crumbs, obj[key]);
            } else if (action === ProjectTreeParseAction.TAGS_TO_SENDERS) {
                ProjectTreeNode.tagsToSenders(obj, finalResult);
            } else if (action === ProjectTreeParseAction.SENDERS_TO_TAGS) {
                ProjectTreeNode.sendersToTags(obj, finalResult);
            } else if (action === ProjectTreeParseAction.TAGS_AND_SENDERS) {
                ProjectTreeNode.tagsAndSenders(obj, finalResult, crumbs);
            } else {
                throw new Error('action not supported');
            }
            return;
        }
        for (const key in obj) {
            // console.log(key);
            if (ProjectTreeNode.isArray(obj[key])) {
                if (action === ProjectTreeParseAction.TO_MATERIAL_TREE) {
                    ProjectTreeNode.addLeafNode(
                        finalResult,
                        key,
                        crumbs,
                        obj[key]
                    );
                } else if (action === ProjectTreeParseAction.TAGS_TO_SENDERS) {
                    ProjectTreeNode.tagsToSenders(obj[key], finalResult);
                } else if (action === ProjectTreeParseAction.SENDERS_TO_TAGS) {
                    ProjectTreeNode.sendersToTags(obj[key], finalResult);
                } else if (action === ProjectTreeParseAction.TAGS_AND_SENDERS) {
                    const newCrumbs = JSON.parse(JSON.stringify(crumbs));
                    newCrumbs.push(key);
                    ProjectTreeNode.tagsAndSenders(
                        obj[key],
                        finalResult,
                        newCrumbs
                    );
                } else {
                    throw new Error('action not supported');
                }
                continue;
            }
            if (!obj.hasOwnProperty(key)) continue;

            if (typeof obj[key] !== 'object') {
                console.log(key + obj[key]);
            } else {
                const newCrumbs = [];
                for (const crumb of crumbs) {
                    newCrumbs.push(crumb);
                }
                newCrumbs.push(key);
                ProjectTreeNode.recursiveLoad(
                    obj[key],
                    newCrumbs,
                    finalResult,
                    action
                );
            }
        }
    }
}
