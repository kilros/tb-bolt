import axios from "axios";
import { URLs } from "./constants";

const getDataFromSubgraph = async (query) => {
  try {
    const result = await axios.post(URLs.SubgraphURL, {
      query,
    });

    return { isSuccess: true, data: result.data.data };
  } catch (error) {
    return { isSuccess: false, data: "" };
  }
};

export const getMyDocList = async (account) => {

  let query = `{
    documents(where: {createdBy: "${account}"}) {
      id
      title
      type
      createdAt
      status
    }
  }`;
  try {
    const res = await getDataFromSubgraph(query);
    return res.data.documents;
  } catch (e) {
    console.log(e, "============error in get doc list from subgraph============");
    return [];
  }
};

export const getSharedList = async (account) => {

  let query = `{
    collab(id: "${account}") {
      relations(where: {isCollab: true}) {
        document {
          id
          title
          type
          createdBy {
            id
            userName
            company
          }
          createdAt
          status
        }
      }
    }
  }`;

  try {
    const res = await getDataFromSubgraph(query);
    const rels = res.data.collab?.relations;
    if (rels) {
      const docs = rels.map((item) => item.document);

      return docs;
    } else
      return [];

  } catch (e) {
    console.log(e, "============error in get shared doc list from subgraph============");
    return [];
  }
};

export const getDocData = async (docId) => {
  let query = `{
    document(id: "${docId}") {
      cid
      createdAt
      createdBy {
        id
      }
      currentReq 
      requests(orderBy: date, orderDirection: desc) {
        requestCID
      }
      collabs
      signedNumber
      status
      title
      type
    }
  }`;

  try {
    const res = await getDataFromSubgraph(query);
    return res.data.document;
  } catch (e) {
    console.log(e, "============error in get doc data============");
    return [];
  }
}

export const getESignData = async (address, docId) => {
  let query = `{
    relations(where: {document: "${docId}"}) {
      role
      collab {
        id
        userName
      }
    }
    esigns(where: {document: "${docId}"}) {
      cid
      date
      collab {
        id
      }
    }
  }`;

  try {
    const res = await getDataFromSubgraph(query);
    const esigns = res.data.esigns;
    const rels = res.data.relations;
    let esignList = [];
    let isSigned = false;
    for (const rel of rels) {
      const filterL = esigns.filter((esign) => esign.collab.id == rel.collab.id);
      if (filterL.length > 0) {
        const esign = filterL[0];
        if (esign.collab.id == address.toLowerCase())
          isSigned = true;
        esignList.push({ collab: rel.collab, role: rel.role, cid: esign.cid, date: esign.date, isSigned: true });
      }
      else {
        esignList.push({ collab: rel.collab, role: rel.role, cid: null, date: null, isSigned: false });
      }
    }
    return { esignList: esignList, isSigned: isSigned };
  } catch (e) {
    console.log(e, "============error in get esign data from subgraph============");
    return null;
  }
}

export const getRequestData = async (reqId) => {
  let query = `{
      request(id: "${reqId}") {
        requestCID
        collab {
          id
          userName
        }
      }
  }`;

  try {
    const res = await getDataFromSubgraph(query);
    return res.data.request;
  } catch (e) {
    console.log(e, "============error in get doc list from subgraph============");
    return null;
  }
}

export const getRequestConfirmStatus = async (reqId, docId) => {
  let query = `{
    requestConfirms(where: {request: "${reqId}"}) {
      isConfirm
      collab {
        id
        userName
      }
    }
    relations(where: {document: "${docId}"}) {
      collab {
        id
        userName
      }
      isCollab
      isOwner
      role
    }
  }  
  `;

  try {
    const res = await getDataFromSubgraph(query);
    const result = res.data.requestConfirms;
    const confirmList_ = (result.filter((item) => item.isConfirm)).map((item) => item.collab);
    const revokeList_ = (result.filter((item) => !item.isConfirm)).map((item) => item.collab);

    const rels = res.data.relations;
    const totalCollabList = (rels.filter((item) => item.isCollab == true || item.isOwner == true));

    let collabList = [];
    let waitingList = [];
    let revoked = false;
    let confirmNum = 0;
    totalCollabList.map((rel) => {
      if (confirmList_.filter((item) => item.id == rel.collab.id).length > 0) {
        collabList.push({ collab: rel.collab, status: 0, role: rel.role });
        confirmNum++;
      } else if (revokeList_.filter((item) => item.id == rel.collab.id).length > 0) {
        collabList.push({ collab: rel.collab, status: 1, role: rel.role });
        revoked = true;
      } else {
        collabList.push({ collab: rel.collab, status: 2, role: rel.role });
        waitingList.push(rel.collab);
      }
    })
    return { collabList: collabList, waitingList: waitingList, revoked: revoked, confirmNum: confirmNum };
  } catch (e) {
    console.log(e, "============error in get confirm status list from subgraph============");
    return null;
  }
}

export const getDocHistory = async (docId, account) => {
  let query = `{
      histories(where: {document: "${docId}"}, orderBy: date, orderDirection: asc) {
        request {
          id
        }
        date
        type
        collab {
          id
          userName
        }
        collabs
      }
    }  
  `;

  try {
    const res = await getDataFromSubgraph(query);
    const histories = res.data.histories;

    let history = [];
    for (const action of histories) {
      let desc = "";
      let link = null;
      let color = "";
      const name = action.collab.id == account.toLowerCase() ? "YOU" : action.collab.userName;
      switch (action.type) {
        case 0:
          desc = `Initialized the contract.`;
          link = action.request.id;
          color = "text-blue-500";
          break;
        case 1:
          desc = `Requsted an Update.`;
          link = action.request.id;
          color = "text-sky-500";
          break;
        case 2:
          desc = `Accepted the Request.`;
          color = "text-emerald-500";
          break;
        case 3:
          desc = `Refused the Request.`;
          color = "text-rose-500";
          break;
        case 4:
          desc = `Approved the Content.`;
          color = "text-teal-500";
          break;
        case 5:
          desc = `Revoked the Content`;
          color = "text-rose-700";
          break;
        case 6:
          desc = `Finalized the Contract.`;
          color = "text-violet-500";
          break;
        case 7:
          desc = `ESigned`;
          color = "text-cyan-500";
          break;
        case 8:
          desc = `Included in the contract`;
          color = "text-pink-500";
          break;
        case 9:
          desc = `Removed from the contract`;
          color = "text-red-500";
          break;
      }

      history.push({ name: name, time: action.date * 1000, desc: desc, link: link, color: color })
    }

    return history;
  } catch (e) {
    console.log(e, "============error in get action list from subgraph============");
    return [];
  }
}

export const getNotifications = async (account, lastTime) => {
  let query = `{
      histories(where: {collabs_contains: ["${account.toLowerCase()}"]}, orderBy: date, orderDirection: desc) {
        document {
          id
          status
          title
          createdBy {
            id
          }
        }
        request {
          id
        }
        date
        type
        docStatus
        collab {
          id
          userName
        }
      }
    relations(
        where: {and: [{collab: "${account.toLowerCase()}"}, {or: [{permission_lt: 3}, {isOwner: true}]}]}
      ) {
        document {
          id
          title
        }
        permission
        isOwner
      }
    }  
  `;

  try {
    const res = await getDataFromSubgraph(query);
    const histories = res.data.histories;

    let history = [];

    for (const action of histories) {
      let desc = "";
      const name = action.collab.id == account.toLowerCase() ? "YOU" : action.collab.userName;
      switch (action.type) {
        case 0:
          desc = `${name.toUpperCase()} created "${action.document.title}".`;
          break;
        case 1:
          desc = `${name.toUpperCase()} submitted a request.`;
          break;
        case 2:
          desc = `${name.toUpperCase()} accepted the request.`;
          break;
        case 3:
          desc = `${name.toUpperCase()} refused the request.`;
          break;
        case 4:
          desc = `${name.toUpperCase()} approved "${action.document.title}" update.`;
          break;
        case 5:
          desc = `${name.toUpperCase()} revoked "${action.document.title}" update`;
          break;
        case 6:
          desc = `${name.toUpperCase()} finalized "${action.document.title}".`;
          break;
        case 7:
          desc = `${name.toUpperCase()} ESigned on "${action.document.title}"`;
          break;
        case 8:
          desc = `${name.toUpperCase()} was added to the collab list.`;
          break;
        case 9:
          desc = `${name.toUpperCase()} was removed from the collab list.`;
          break;
        case 10:
          desc = `${name.toUpperCase()}'s permission was changed.`;
      }

      history.push({
        time: action.date * 1000,
        isNew: Math.floor(lastTime / 1000) < action.date,
        desc: desc, 
        docId: action.document.id,
        docTitle: action.document.title,
        status: action.document.status,
        hasLink: action.document.status == action.docStatus,
        isMyDoc: action.document.createdBy.id == account.toLowerCase()
      })
    }

    return { history: history, relations: res.data.relations };
  } catch (e) {
    console.log(e, "============error in get history list from subgraph============");
    return null;
  }
}

export const getCollabs = async (docId) => {
  let query = `{
    relations(where: {and: [{isCollab: true}, {document: "${docId}"}]}) {
      collab {
        id
        userName
      }
    }
  } 
`;

  try {
    const res = await getDataFromSubgraph(query);
    if (res.isSuccess) return res.data.relations

    return [];

  } catch (e) {
    console.log(e, "============error in get collabs list from subgraph============");
    return [];
  }
}