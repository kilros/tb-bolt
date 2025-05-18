import { writeContract, readContract, readContracts, waitForTransactionReceipt } from "@wagmi/core";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { URLs } from "./constants";
import {
  TBDMSContract,
  TBFaucetContract,
} from "./contracts";
import { zeroAddress } from "viem";

const CustomSuccessToast = ({ message, link }) => (
  <div
    style={{
      color: "white",
      padding: "10px",
    }}
  >
    <div>{message}</div>
    <a
      href={`https://sepolia.basescan.org/tx/${link}`}
      target="_blank"
      className="border-b-2 border-white"
    >
      {link}{" "}
    </a>
  </div>
);

const unpinFile = async (cid) => {
  await axios.post(`${URLs.TBBackendAPI}/unPinFile`, { cid }, { withCredentials: true }, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

const uploadDoc = async (data) => {
  try {
    const res = await axios.post(`${URLs.TBBackendAPI}/uploadDoc`, data, { withCredentials: true }, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (e) {
    console.log(e, "============error============");
    return null;
  }
};

const uploadImg = async (imgUrl) => {
  try {
    const res = await axios.post(`${URLs.TBBackendAPI}/uploadImg`, { imgUrl: imgUrl }, { withCredentials: true }, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (e) {
    console.log(e, "============error============");
    return null;
  }
}

const createSign = async (account, docId, cid) => {
  const res = await axios.post(`${URLs.TBBackendAPI}/createSign`, { creator: account, docId: docId, cid: cid }, { withCredentials: true }, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.data;
}

/** function to mint hoody nft */
export const createNewContract = async (config, account, title, type, collabs, content) => {
  let cid;
  try {
    const result = await uploadDoc({ title: title, type:type,  content: content, isNew: true, creator: account });
    if (result.isSuccess) {
      cid = result.hash;
      const sign = await createSign(account, 0, cid);
      if (sign.isSuccess) {
        const hash = await writeContract(config, {
          ...TBDMSContract,
          functionName: "createDoc",
          args: [collabs, title, type, cid, sign.signature],
        });
        const res = await waitForTransactionReceipt(config, { hash });
        if (res.status == "success") {
          toast.success(
            <CustomSuccessToast message="Created Successfully." link={hash} />
          );
          return true;
        } else {
          toast.error("Create Failed.");
          await unpinFile(cid)
        }
      } else {
        toast.error("Create Signature Failed.")
        await unpinFile(cid)
      }
    }
    else {
      toast.error("Upload failed.");
    }
  } catch (e) {
    console.log(e);
    toast.error("Create failed.");
  }
  return false;
};

export const signOnDoc = async (config, account, docId, imgUrl) => {
  let cid;
  try {
    const result = await uploadImg(imgUrl);
    if (result.isSuccess) {
      cid = result.hash;
      const sign = await createSign(account, docId, cid);
      if (sign.isSuccess) {
        const hash = await writeContract(config, {
          ...TBDMSContract,
          functionName: "addESign",
          args: [docId, cid, sign.signature],
        });
        const res = await waitForTransactionReceipt(config, { hash });
        if (res.status == "success") {
          toast.success(
            <CustomSuccessToast message="ESign Successful." link={hash} />
          );
          return true;
        } else {
          toast.error("ESign Failed.");
          await unpinFile(cid)
        }
      } else {
        toast.error("Create Signature Failed.")
        await unpinFile(cid)
      }
    }
    else {
      toast.error("Upload failed.");
    }
  } catch (e) {
    console.log(e);
    if (cid != null)
      await unpinFile(cid)
    toast.error("ESign failed.");
  }
  return false;
};

export const requestUpdate = async (config, account, docId, content) => {
  let cid;
  try {
    const result = await uploadDoc({ docId: docId, content: content, isNew: false });
    if (result.isSuccess) {
      cid = result.hash;
      const sign = await createSign(account, docId, cid);
      if (sign.isSuccess) {
        const hash = await writeContract(config, {
          ...TBDMSContract,
          functionName: "requestDocUpdate",
          args: [docId, cid, sign.signature],
        });
        const res = await waitForTransactionReceipt(config, { hash });
        if (res.status == "success") {
          toast.success(
            <CustomSuccessToast message="Request Successful." link={hash} />
          );
          return true;
        } else {
          toast.error("Request Failed.");
          await unpinFile(cid)
        }
      } else {
        toast.error("Create Signature Failed.")
        await unpinFile(cid)
      }
    }
    else {
      toast.error("Upload failed.");
    }
  } catch (e) {
    console.log(e);
    if (cid != null)
      await unpinFile(cid)
    toast.error("Request failed.");
  }
  return false;
};

export const readDocContent = async (reqCID) => {
  if (reqCID) {
    try {
      const res = await axios.post(`${URLs.TBBackendAPI}/readReq`, { reqCID: reqCID }, { withCredentials: true }, {
        headers: {
          "Content-Type": "application/json",
        }
      });

      return res.data;
    } catch {
      // toast.error("Please check wallet connection!");
      return { isSuccess: false };
    }
  }

  return { isSuccess: false };
}

export const confirmRequest = async (config, reqId) => {
  try {
    const hash = await writeContract(config, {
      ...TBDMSContract,
      functionName: "confirmRequest",
      args: [reqId],
    });
    const res = await waitForTransactionReceipt(config, { hash });
    if (res.status == "success") {
      toast.success(
        <CustomSuccessToast message="Approve Successful." link={hash} />
      );
      return true;
    } else {
      toast.error("Approve Failed.");
      return false;
    }
  } catch (e) {
    console.log(e);
    toast.error("Approve failed.");
    return false;
  }
}

export const revokeRequest = async (config, reqId) => {
  try {
    const hash = await writeContract(config, {
      ...TBDMSContract,
      functionName: "revokeRequest",
      args: [reqId],
    });
    const res = await waitForTransactionReceipt(config, { hash });
    if (res.status == "success") {
      toast.success(
        <CustomSuccessToast message="Revoke Successful." link={hash} />
      );
      return true;
    } else {
      toast.error("Revoke Failed.");
      return false;
    }
  } catch (e) {
    console.log(e);
    toast.error("Revoke failed.");
    return false;
  }
}

export const confirmDoc = async (config, reqId) => {
  try {
    const hash = await writeContract(config, {
      ...TBDMSContract,
      functionName: "confirmDocContent",
      args: [reqId],
    });
    const res = await waitForTransactionReceipt(config, { hash });
    if (res.status == "success") {
      toast.success(
        <CustomSuccessToast message="Confirm Contract Successful." link={hash} />
      );
      return true;
    } else {
      toast.error("Confirm Contract Failed.");
      return false;
    }
  } catch (e) {
    console.log(e);
    toast.error("Confirm Contract failed.");
    return false;
  }
}

export const finalizeDoc = async (config, docId) => {
  try {
    const hash = await writeContract(config, {
      ...TBDMSContract,
      functionName: "finalizeDocContent",
      args: [docId],
    });
    const res = await waitForTransactionReceipt(config, { hash });
    if (res.status == "success") {
      toast.success(
        <CustomSuccessToast message="Finalized Doc Successfully." link={hash} />
      );
      return true;
    } else {
      toast.error("Finalize Doc Failed.");
      return false;
    }
  } catch (e) {
    console.log(e);
    toast.error("Finalize Doc failed.");
    return false;
  }
}

export const revokeDoc = async (config, reqId) => {
  try {
    const hash = await writeContract(config, {
      ...TBDMSContract,
      functionName: "revokeDocContent",
      args: [reqId],
    });
    const res = await waitForTransactionReceipt(config, { hash });
    if (res.status == "success") {
      toast.success(
        <CustomSuccessToast message="Revoke Contract Successful." link={hash} />
      );
      return true;
    } else {
      toast.error("Revoke Contract Failed.");
      return false;
    }
  } catch (e) {
    console.log(e);
    toast.error("Revoke Contract failed.");
    return false;
  }
}

export const getUser = async (config, account) => {
  const userInfo = await readContract(config, {
    ...TBDMSContract,
    functionName: "users",
    args: [account],
  })
  return userInfo;
}

export const getUserName = async (config, account) => {
  const userInfo = await readContract(config, {
    ...TBDMSContract,
    functionName: "users",
    args: [account],
  })
  return userInfo[0];
}

export const getRegisterStatus = async (config, account) => {
  const isRegistered = await readContract(config, {
    ...TBDMSContract,
    functionName: "isRegistered",
    args: [account],
  })

  return isRegistered;
}

export const isNewName = async (config, userName) => {
  const res = await getUserAddr(config, userName);

  if (res == zeroAddress) return true
  return false;
}

export const getUserAddr = async (config, userName) => {
  const res = await readContract(config, {
    ...TBDMSContract,
    functionName: "isRegisteredUserName",
    args: [userName]
  })

  return res;
}

export const registerUser = async (config, userName, firstName, lastName, company, position) => {
  try {
    const hash = await writeContract(config, {
      ...TBDMSContract,
      functionName: "registerUser",
      args: [userName, firstName, lastName, company, position],
    });
    const res = await waitForTransactionReceipt(config, { hash });
    if (res.status == "success") {
      toast.success(
        <CustomSuccessToast message="Registered Successfully." link={hash} />
      );
      return true;
    } else {
      return false;
    }
  } catch (e) {
    console.log(e);
    return false;
  }
}

export const editUser = async (config, userName, company, position) => {
  try {
    const hash = await writeContract(config, {
      ...TBDMSContract,
      functionName: "editUser",
      args: [userName, company, position],
    });
    const res = await waitForTransactionReceipt(config, { hash });
    if (res.status == "success") {
      toast.success(
        <CustomSuccessToast message="Profile updated successfully." link={hash} />
      );
      return true;
    } else {
      toast.error("Failed to update profile.");
      return false;
    }
  } catch (e) {
    console.log(e);
    toast.error("Failed to update profile.");
    return false;
  }
}

export const addCollabsToDoc = async (config, docId, collabs) => {
  try {
    const hash = await writeContract(config, {
      ...TBDMSContract,
      functionName: "addCollabs",
      args: [docId, collabs],
    });
    const res = await waitForTransactionReceipt(config, { hash });
    if (res.status == "success") {
      toast.success(
        <CustomSuccessToast message="Added Successfully." link={hash} />
      );
      return true;
    } else {
      toast.error("Add Failed.");
      return false;
    }
  } catch (e) {
    console.log(e);
    toast.error("Add failed.");
    return false;
  }
}

export const removeCollabsFromDoc = async (config, docId, collabs) => {
  try {
    const hash = await writeContract(config, {
      ...TBDMSContract,
      functionName: "removeCollabs",
      args: [docId, collabs],
    });
    const res = await waitForTransactionReceipt(config, { hash });
    if (res.status == "success") {
      toast.success(
        <CustomSuccessToast message="Removed Successfully." link={hash} />
      );
      return true;
    } else {
      toast.error("Remove Failed.");
      return false;
    }
  } catch (e) {
    console.log(e);
    toast.error("Add failed.");
    return false;
  }
}

export const getSubscribe = async (config, address) => {
  const res = await readContract(config, {
    ...TBFaucetContract,
    functionName: "deadline",
    args: [address]
  })

  const now = Math.floor((new Date()).getTime() / 1000);
  return Number(res) > now;
}

export const subscribe = async (config, address) => {
  try {

    const subStatus = await getSubscribe(config, address);
    if (!subStatus) {
      const res = await axios.post(`${URLs.TBBackendAPI}/subscribe`, ({ address: address }), { withCredentials: true }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return res.data.isSuccess;
    }
    return true;
  } catch (e) {
    return false;
  }
}
