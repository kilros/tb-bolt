export const URLs = {
	TBBackend: "http://localhost:8085",
	TBBackendChat: "http://localhost:8085/chat",
	TBBackendAuth: "http://localhost:8085/auth",
	TBBackendAPI: "http://localhost:8085/api",
	TBBackendTime: "http://localhost:8085/time",
	TBBackendCTime: "http://localhost:8085/ctime",
	TBBackendTemplate: "http://localhost:8085/template",
	TBBackendClause: "http://localhost:8085/clause",
	TBGateWay: "https://jade-wonderful-hawk-382.mypinata.cloud/ipfs/",
	SubgraphURL: "https://api.studio.thegraph.com/query/72239/tomeblock/version/latest"
};

export const template2 = [
	[{
		"type": "paragraph",
		"children": [
			{
				"text": "",
				"underline": false
			}
		]
	}],
]

export const clause1 = [
	{
		"type": "paragraph",
		"children": [
			{
				"text": "",
				"underline": false
			}
		]
	},
]

export const positions = [
	"CEO",
	"CTO",
	"CFO",
	"Legal Counsel",
	"Manager",
	"Developer",
	"Designer",
	"Product Manager",
	"Project Manager",
	"Marketing Manager",
	"Sales Manager",
	"HR Manager",
	"Other"
];

export const roles = [
	"Representative",
	"Stakeholder"
];

export const permissions = [
	"View",
	"Edit",
	"ESign"
];

export const permissionVal = {
	"View": 0,
	"Edit": 1,
	"ESign": 2,
}

export const docTypes = [
	"Sales Agreement",
	"Service Agreement",
	"Lease Agreement",
	"Non-Disclosure Agreement"
];
