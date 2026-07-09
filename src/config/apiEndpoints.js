// src/config/apiEndpoints.js
// Centralized API endpoint definitions + base URL builder

// ================= BASE URLS FROM .ENV =================

const USE_DEV_PROXY = process.env.NODE_ENV === 'development';


const BASES = {
  API: process.env.REACT_APP_API_BASE_URL || '',
  ASSETS: process.env.REACT_APP_ASSETS_BASE_URL || '',
  SERVICES: process.env.REACT_APP_SERVICES_API_BASE_URL || '',
  SERVICES_AZURE: process.env.REACT_APP_SERVICES_AZURE_BASEURL || '',
  MEDIA: process.env.REACT_APP_MEDIA_SERVICES_API_BASE_URL || '',
  WCF: process.env.REACT_APP_WCF_API_BASE_URL || '',
  APPOINTMENT: process.env.REACT_APP_APPOINTMENT_API_BASE_URL || ''
};

// ================= HELPER TO BUILD FULL URL =================



export function buildUrl(baseKey, relPath) {
  if (!relPath) return '';

  const trimmed = String(relPath).trim();

  // If already full URL, return it
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  // ✅ Use proxy in development for SERVICES only
  if (USE_DEV_PROXY && baseKey === 'SERVICES') {
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }

  const base = (BASES[baseKey] || '').replace(/\/+$/, '');
  const relative = trimmed.replace(/^\/+/, '');

  if (!base) return `/${relative}`;

  return `${base}/${relative}`;
}



// ================= MAIN ENDPOINT OBJECT =================

const API_ENDPOINTS = {
  TICKET_SUPPORT: {
    BIND_USERS: '/TicketSupport/BindUsersForLeadPupup'
  },
  BANNER: {
    banner: '/Common/CommonActionModebased',
    GET_USER_SEGMENTS: '/BannerSetting/GetSegmentNameList'
  },
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password'
  },

  ENQUIRIES: {
    LIST: '/enquiries',
    CREATE: '/enquiries',
    GET: (id) => `/enquiries/${id}`,
    UPDATE: (id) => `/enquiries/${id}`,
    DELETE: (id) => `/enquiries/${id}`,
    IMPORT: '/enquiries/import',
    EXPORT: '/enquiries/export',
    MERGE: '/enquiries/merge',
    FIND_DUPLICATES: '/enquiries/duplicates',
    ACTIVITIES: (id) => `/enquiries/${id}/activities`,
    GET_ENQUIRY_ACTIVITY: '//UserCRMCampaign/Service/CRMService.asmx/GetEnquiryActivity',
    //GET_ENQUIRY_ACTIVITYIVITY: '/UserCRM/GetLeadActivity',
    GET_PHYSICAL_APPOINTMENT_LIST: '/UserCRMCampaign/Service/ToDoService.asmx/GetPhysicalAppointmentWidgetList',
    //GET_PHYSICAL_APPOINTMENT_LIST: '/UserCRM/GetPhysicalAppointmentFormDetail',
    SAVE_ADD_LEAD_OR_MERGE: '/UserCRMCampaign/Service/CRMService.asmx/AddLeadEnquiry',
    //SAVE_ADD_LEAD_OR_MERGE: '/UserCRM/AddEnquiry',
    GET_SCHEDULE_CALL_ACTION: '/DialerSetting/GetScheduleCallAction',
    GET_MOBILE_NUMBER: '/DialerSetting/GetEntityMobileNosForSchedule',
    UPDATE_DIALER_DATA: '/DialerSetting/UpdateDialerData',
    ENQUIRY_DEATILS: '/UserCRM/ShowEnquiryData',
    CUSTOME_DATA_MORE: '/SalesTarget/custom_enquiry_data',
    GET_SOURCE_SETTING: '/UserCRM/GetSourceSettingsList',
    SAVE_USER_SOURCE_SETTING: '/UserCRM/InsertUserSourceSetting',
    DELETE_USER_SOURCE_SETTING: '/UserCRM/DeleteUserSourceSetting',
    UPDATE_USER_SOURCE_SETTING: '/UserCRM/UpdateUserSourceSetting',
    GET_MEDIUM_SETTING: '/Common/GetUserMediumSettingsByParentId',
    GET_CAMPAIGN_SETTING: '/Common/GetUserCampaignSettingsByParentId',
    UPDATE_ENQUIRY: '/UserCRMCampaign/Service/CRMService.asmx/EditEnquiry',
    //UPDATE_ENQUIRY: '/UserCRM/SaveEnquiry',
    DELETE_ENQUIRY_DETAILS: '/UserCRM/DeleteEnquiryDetail',
    GET_LEAD_CONFLICT: '/UserCRM/GetLeadConflicts',
    GET_LEAD_CUSTOM_DATA: '/UserCRM/GetLeadData',
    MERGE_TO_LEAD: '/UserCRM/UpdateConflictedEnquryToLead',
    GET_PREFRENCE_COL: '/UserCRM/GetPreferenceColEnquiry',
    SAVE_PDF_OVERLAY_SETTING: '/UserCRM/SaveEnquiryPDFPreference',
    SAVE_PDF: '/UserCRM/GetEnquiryDetailsPdf',
    GET_DUPLICATE_ENQUIRY: '/UserCRMCampaign/Service/MergeDuplicateEnquiry.asmx/GetDublicateEnquiry',
    //GET_DUPLICATE_ENQUIRY: '/UserCRM/GetEnquiryConflictedLead',
    GET_DUPLICATE_ENQUIRY_BY_ENQUIRY_ID: '/UserCRMCampaign/Service/MergeDuplicateEnquiry.asmx/GetDublicateEnquiryByEnquiryId',
    //GET_DUPLICATE_ENQUIRY_BY_ENQUIRY_ID: '/UserCRM/GetConflictLeadListByEnquiryId',
    DELETE_DUPLICATE_ENQUIRY: '/UserCRMCampaign/Service/MergeDuplicateEnquiry.asmx/DeleteEnquiryDuplicate',
    //DELETE_DUPLICATE_ENQUIRY: '/UserCRM/MergeEnquiryToLead',
    ENQUIRY_DETAILS_LIST: '/Enquiry/GetEnquiryList',
    GET_MEETING_SETTING: '/UserCRMCampaign/Service/BBBMeetingService.asmx/GetMeetingSettingList',
    //GET_MEETING_SETTING: '/UserCRM/GetMeetingSettingList',
    GET_MEETING_HOST: '/UserCRMCampaign/Service/BBBMeetingService.asmx/GetMeetEntityDetails',
    //GET_MEETING_HOST: '/UserCRM/GetMeetingSettingList',
    EDIT_MEETING_SETTING: '/UserCRMCampaign/Service/BBBMeetingService.asmx/EditMeetingSettings',
    //EDIT_MEETING_SETTING: '/UserCRM/GetMeetingSettingList',
    GET_LEAD_DETAILS_NEW: '/UserCRM/GetLeadDetailListNew',
    GET_ENQIURY_ACTIVITY: '/UserCRMCampaign/Service/CRMService.asmx/GetEnquiryActivity',
    //GET_ENQIURY_ACTIVITY: '/UserCRM/GetLeadActivity',
    GET_ASSOCIATE_MOBILE_NO_WHATSAPP: '//IMSMOB/GetAssociatedMobileNo',
    GET_ASSOCIATE_WRAPPER: '/IMSMOB/AssociateDeissociateWrapper',
    CREATE_MEETING: '/UserCRMCampaign/Service/BBBMeetingService.asmx/CreateMeeting',
    //CREATE_MEETING: '/UserCRM/SaveMeetingDetails',
    SAVE_MEETING_DETAILS: '/UserCRMCampaign/Service/BBBMeetingService.asmx/SaveMeetingDetails',
    //SAVE_MEETING_DETAILS: '/UserCRM/SaveMeetingDetails',
    MASS_DELETE_ENQUIRY: '/UserCRMCampaign/Service/CRMService.asmx/MassDeleteHashedLeadEnquiry',
    //MASS_DELETE_ENQUIRY: '/UserCRM/DeleteEnquiryDetail',
    CREATE_MEETING_SAVE: '/UserCRMCampaign/Service/BBBMeetingService.asmx/GetServerDetails',
    //CREATE_MEETING_SAVE: '/UserCRM/GetServerDetails',
    CUSTOM_SEARCH_DROPDOWN: '/Report/GetLeadSearchName',
    MASS_UPDATE_BIND_FIELD: '/UserCRMCampaign/Service/CRMService.asmx/BindUpdateField',
    //MASS_UPDATE_BIND_FIELD: '/Common/UpdateField',
    MASS_UPDATE_SAVE: '/UserCRMCampaign/Service/CRMService.asmx/MassUpdateLeadEnquiry',
    //MASS_UPDATE_SAVE: '/UserCRM/UpdateMassLeadEnquiryFromExcel_New',
    GET_STAGE_LIST: '/UserCRM/getStageList',
    GET_MARKETING_SEQUENCE: '/UserCRM/GetSequenceLeadEnquiry',
    SAVE_MASS_SEQUENCE: '/UserCRM/AddMassSequence_New',
    ADD_REMOVE_TAGS: '/UserCRM/AddEnquiryTags',

    MASS_INTERNATIONAL_SMS_ID_CONVERSION: '/UserCRM/SendMassInternationalSMS_New',
    USE_AUTH: '/UserCRM/GetAuthKey',

    GET_COLUMN_LIST_FOR_EXPORTSETTING: "/TicketSupport/TicketAction",

    ADD_CALL_LIST_SAVE: '/UserCRM/AddMassCallList_New',
    SAVE_MASS_FOLLOWUP: '/UserCRM/AddMassEnquiryFollowup_New',
    SEND_MASS_SMS: '/UserCRM/SendMassEnquirySMS_New',
    GET_TEMPLATE_NEW: '/UserCRM/GetDLTTemplates',
    GET_TEMPLATE_DETAILS: '/UserCRM/GetDLTTemplateDetails',
    GET_SHORT_URL: '/UserCRM/TrakDomain',
    SEND_MAIL_NEW: '/UserCRM/SendMassEnquiryMail_New',

    ADD_ENQUIRY: '/UserCRM/AddEnquiry',
    SAVE_ENQUIRY_WITH_LOCATION: '/UserCRM/SaveEnquiryWithLocation',

    IMPORT_ENQIURY: '/UserCRM/ImportEnquiryData',
    EXPORT_ENQUIRY_DEFAULT: '/UserCRM/GetExportEnquiryDetails',

    GET_CUSTOM_FIELDS: '/UserCRM/GetCustomFields',
    ADD_CUSTOM_FIELD: '/UserCRM/AddCustomField',
    UPDATE_CUSTOM_FIELD: '/UserCRM/UpdateCustomField',
    SAVE_FIELD_SEQUENCE: '/UserCRM/SaveFieldSequence',
    BIND_PARENT_CHILD: '/UserCRM/BindParentChildDetail',
    GET_FORMULA_PARAM: '/UserCRM/GetFormulaParamDetail',
    BIND_CHILD_TO_CHILD_PARENT_TO_PARENT: '/UserCRM/BindChildtochildParenttoParent',
    GET_TASK_PHYSICAL_APPOINTMENT_TYPE: '/UserCRM/GetCustomUserTaskListByUserId',
    GET_PREDEFINED_TEMPLATE: '/UserCRM/GetEnquiryPredefinedMappings',
    GET_ENQUIRY_COLUMNS_FOR_DOWNLOAD: '/UserCRM/GetEnquiryMappingFieldColumns',
    SAVE_NEW_TEMPLATE: '/UserCRM/SaveCustomEnquiryImportFields',
    GET_PREDEFINED_TEMMPLATE: '/UserCRM/GetImportTemplateColumns',
  },

  LEADS: {
    LIST: '/leads',
    CREATE: '/leads',
    GET: (id) => `/leads/${id}`,
    UPDATE: (id) => `/leads/${id}`,
    DELETE: (id) => `/leads/${id}`,
    IMPORT: '/leads/import',
    EXPORT: '/leads/export',
    ASSIGN: (id) => `/leads/${id}/assign`,
    MERGE: '/leads/merge',
    ACTIVITIES: (id) => `/leads/${id}/activities`,
    DOCUMENTS: (id) => `/leads/${id}/documents`,
    DELETE_DOCUMENT: (leadId, docId) => `/leads/${leadId}/documents/${docId}`,
    CUSTOM_FIELDS: (id) => `/leads/${id}/custom-fields`,
    Lead_For_Redirect: '/UserCRMCampaign/Service/LeadService.asmx/GetLeadDetailListNew',
    AI_CHAT_SUMMARY: '/AIData/LeadFollowupData'

  },

  FOLLOWUPS: {
    GET_LIST: '/UserCRM/GetFollowupListByUserId',
    BULK_UPDATE: '/followups/bulk-update',
    //SCORE_CARD_DETAILS: '/UserCRMCampaign/Service/ScoreCard.asmx/funcToGetScoreCardDetails',
    SCORE_CARD_DETAILS: '/UserCRM/funcToGetScoreCardDetails',
   
    GET_CENTER_OF_EDUCATION_EDIT: '/UserCRM/GetData',
    //GET_CAMPAIGN_FOR_EDIT: '/UserCRMCampaign/Service/CRMService.asmx/BindSourceMediumCampaign',
    GET_CAMPAIGN_FOR_EDIT: '/UserCRM/BindSourceMediumCampaign',
    //WEB_FORMDETAILS_BY_LEADid: '/UserCRMCampaign/Service/CRMService.asmx/GetWebformDetailsByLeadId',
    WEB_FORMDETAILS_BY_LEADid: '/UserCRM/GetWebformDetailsByLeadId',
    ADD_FOLLOWUP_DLT: '/UserCRM/AddLeadFollowup_DLT',
    FOLLOWUP_EXPORT: '/SalesTarget/ExportFollowup',
    FOLLOWUP_EXPORT_NEW: '/SalesTarget/ExportFollowup_New',
    //GET_FOLLOWUP_LIST: '//UserCRMCampaign/Service/ToDoService.asmx/GetFollowUpList',
    GET_FOLLOWUP_LIST:'/UserCRM/GetFollowupListByUserId',
    //FOLLOWUP_FOR_REDIRECT: '/UserCRM/GetFollowupListByUserId',
  },

  TASKS: {
    LIST: '/api/tasks',
    CREATE: '/api/tasks',
    GET: (id) => `/api/tasks/${id}`,
    UPDATE: (id) => `/api/tasks/${id}`,
    DELETE: (id) => `/api/tasks/${id}`,
    BULK_UPDATE: '/tasks/bulk-update',
    BY_LEAD: (leadId) => `/tasks/lead/${leadId}`,
    LEAD_DETAILS: (leadId) => `/api/tasks/lead/${leadId}`,
    LEAD_ACTIVITIES: (leadId) => `/api/tasks/lead/${leadId}/activities`,
    LEAD_CHATLOGS: (leadId) => `/api/tasks/lead/${leadId}/chatlogs`,
    LEAD_DEALHISTORY: (leadId) => `/api/tasks/lead/${leadId}/dealhistory`,
    GET_USER_LIST_FORTASK: 'UserCRM/GetTaskListByUserIdNew',
    GET_SALES_ACTIVITY_TYPE: '/UserCRM/GetCustomUserTaskListByUserId',
    GET_ACIVITIES_FOR_DETAILS_EDIT: '/UserCRM/GetLeadActivityWithFilterleadwise',
    GET_TASK_HISTORY_FOR_DETAILS_EDIT: '/UserCRM/GetTaskHistoryListByUserIdNew',
    //GET_TASK_HISTORY_FOR_DETAILS_EDIT: '/UserCRMCampaign/Service/LeadAssignmentService.asmx/GetTaskHistoryListByUserId',
    INSERT_NEW_TASK_OR_APPOINTMENT: '/UserCRM/InsertNewTaskOrAppointment_latest',
    //RELATED_TO_SUGGETION: '/UserCRM/RelatedToSuggetion',
    RELATED_TO_SUGGETION: '/UserCRM/RelatedToSuggestion',
    DELETE_TASK: '/UserCRM/DeleteTaskDetailById',
    GET_OUTCOME_LIST: '/UserCRM/GetOutcomeListByTaskId',
    GET_USER_ACTIVITY_LIST: '/UserCRM/GetUserActivityListByUserId',
    GET_PREDEFINED_OUTCOME_LIST: '/UserCRM/GetPredefinedOutcomeListByUserId',
    DELETE_USER_TASK_MASTER: '/UserCRM/DeleteUserTaskMasterById',
    INSERT_NEW_SALES_ACTIVITY: '/UserCRM/InsertNewSalesActivity',
    GET_TASK_CONDITION_LIST: '/UserCRM/GetTaskConditionListByTaskId',
    INSERT_NEW_ACTIVITY_PHYSICAL: '/UserCRM/InsertNewActivityPhysicalNew',
    GET_TASK_PERMISSION_SETTING: '/UserCRM/GetTaskPermissionSetting',
    SAVE_MARK_AS_COMPLETE: '/UserCRM/MarkTaskDetailAsComplitedById',
    ADD_COMMENT: '/UserCRM/SaveTaskCommentMOB',
    EXPORT_DOC: '/SalesTarget/ExportAppointmentOrTask',
    // GET_ENTITY_PLACEHOLDER_FOR_CUSTOM_EXPORT: '/UserCRMCampaign/Service/TriggerCampaign.asmx/FuncToGetEntityPlaceHolder',
    GET_ENTITY_PLACEHOLDER_FOR_CUSTOM_EXPORT: '/UserCRM/FuncToGetEntityPlaceHolder',
    MASS_UPDATE_SAVE: '/UserCRM/MassInsertNewTaskOrAppointment',
    NEW_LEAD_ACTIVITY: '/UserCRM/GetLeadActivity',
    TASK_SETTING_GET_FORMS: '/UserCRM/GetUserWebformListByUserId',
    Task_Settings_Specific_Approver: '/Common/GetUserFromHashedListName',
    EXPENSE_LIST: '/EmployeeTracker/ExpenseHeadList',


  },

  TOKE: {
    UNIVERSAL_TOKEN: -2295521862261168
  },

  APPOINTMENTS: {
    LIST: '/appointments',
    CREATE: '/appointments',
    GET: (id) => `/appointments/${id}`,
    UPDATE: (id) => `/appointments/${id}`,
    DELETE: (id) => `/appointments/${id}`,
    CALENDAR: '/appointments/calendar',
    BY_LEAD: (leadId) => `/appointments/lead/${leadId}`,
    VIRTUAL: '/appointments/virtual',
    PHYSICAL: '/appointments/physical',
    DELETE_TASK: '/Common/CommonActionModebased',
    SAVE_FOLLOWUP: '/UserCRM/SaveFollowup',
    FOLLOWUPSTATUS_LIST: '/UserCRM/GetFollowUpStatus',
    GET_USER_HIRERARCHY_LIST: '/TicketSupport/BindUsersForLeadPupup',
    PRODUCT_SUGGESTION_FOR_FOLLOWUP: 'UserCRM/ProductSuggestions',
    GET_SENDER_IDFOR_SMS: '/UserCRM/GetSenderIdList',
    //ADD_LEAD_FOLLOWUP: '/UserCRMCampaign/Service/CRMService.asmx/AddLeadFollowupGetRecord',
    ADD_LEAD_FOLLOWUP: '/UserCRM/AddLeadFollowUp',
    GET_INTERACTION_HISTORY: '/UserCRM/GetLeadInteractionHistory',

    //GET_SCORE_CARD_DETAILS_FOR_EDIT: 'UserCRMCampaign/Service/ScoreCard.asmx/funcToGetScoreCardDetails',
    GET_SCORE_CARD_DETAILS_FOR_EDIT: '/UserCRM/GetScoreCardDetailsEnquiry',
    //GET_TASK_DETAILS_BYID: '/UserCRMCampaign/Service/LeadAssignmentService.asmx/GetTaskDetailById',
    GET_TASK_DETAILS_BYID:'/UserCRM/GetTaskDetailById',
    
    
    //unused
    GET_TASK_COMMENTS: '/UserCRMCampaign/Service/LeadAssignmentService.asmx/GetTaskCommentsById',
    ATTCHMENT_HANDLER_ADD_COMMENT: '/UserCRMCampaign/Handler/AttachmentHandler.ashx',



    PRODUCT_SUGGESTIONS: '/UserCRM/ProductSuggestions',
    //GET_PHYSICAL_LIST: '/UserCRMCampaign/Service/ToDoService.asmx/GetPhysicalAppointmentList',
    GET_PHYSICAL_LIST: '/EmployeeTracker/GetPhysicalAppointmentListNew',
    GET_USERLIST_PHYSICALAPP_VIEW: '/Common/GetUserListByUserId',
    //GET_USERLIST_PHYSICALAPP_DETAILS_BYID: '/UserCRMCampaign/Service/ToDoService.asmx/GetPhysicalAppointmentById',
    GET_USERLIST_PHYSICALAPP_DETAILS_BYID:'/UserCRM/GetPhysicalAppointmentById',
    PHYSICAL_APPOINTMENT_UPDATE: '/EmployeeTracker/PhysicalAppointmentUpdate',

    // RELATED_TO_SUGGETION: '/UserCRMCampaign/Service/ToDoService.asmx/RelatedToSuggetion',
    RELATED_TO_SUGGETION: '/UserCRM/RelatedToSuggetion',
    PHYSICAL_APPOINTMENT_REMOVE: '/EmployeeTracker/PhysicalAppointmentRemove',
    //unused
    PHYSICAL_COMMENT_ATTACH_DOC: '/UserCRMCampaign/Handler/AttachmentHandler.ashx',
    PHYSICAL_APPOINTMENT_EXPORT: 'UserCRMCampaign/ToDo/physicalappointment.aspx',
    
    PHYSICAL_APPOINTMENT_ADD_NOTE: '/UserCRM/AddNotes',
    SEND_MAIL: '/UserCRM/SendEmail',
    GET_CHAT_LOGS: '/UserCRM/GetTawkToChatLogsByLeadId',
    GET_CON_ID: '/UserCRMCampaign/Service/IMSService.asmx/getConvUserID',
    GET_W_CHAT: '/IMSMOB/GetConversationAsRequiredConvId',
    GET_CALL_LOGS: '/UserCRM/GetCallLog',
    // GET_BIND_UPCOMING_MEETING: '/UserCRMCampaign/Service/BBBMeetingService.asmx/BindUpcomingEntityMeeting',
    GET_BIND_UPCOMING_MEETING: '/UserCRM/GetUpcomingEntityMeeting',
    // GET_BIND_PAST_MEETING: '/UserCRMCampaign/Service/BBBMeetingService.asmx/BindPastEntityMeetingDetails',
    GET_BIND_PAST_MEETING: '/UserCRM/BindPastEntityMeetingDetails',
    // GET_UPCOMING_MEETING_DETAILS: '/UserCRMCampaign/Service/BBBMeetingService.asmx/BindUpcomingMeetingDetails',
    GET_UPCOMING_MEETING_DETAILS: '/UserCRM/BindUpcomingMeetingDetails',
    // GET_PAST_MEETING_DETAILS: '/UserCRMCampaign/Service/BBBMeetingService.asmx/BindPastMeetingDetails',
    GET_PAST_MEETING_DETAILS: '/UserCRM/BindPastMeetingDetails',
    // GET_PARTICIPANTS_DETAILS: '/UserCRMCampaign/Service/BBBMeetingService.asmx/GetParticipantsDetails',
    GET_PARTICIPANTS_DETAILS: '/UserCRM/GetParticipantsDetails',
    MARK_AS_COMPLETE: '/UserCRM/MarkTaskDetailAsComplitedById',
    //unsed
    ADD_COMMENT: '/UserCRMCampaign/Service/ScoreCard.asmx/funcToGetScoreCardDetails',
    MASS_UPDATE: '/UserCRMCampaign/Service/ToDoService.asmx/MassUpdateNewTaskOrAppointment',
    MARK_AS_COMPLETE: '/EmployeeTracker/PhysicalAppointmentOutcomeUpdate',
    //WHATSAPP_TEMPLATE: '/UserCRMCampaign/Service/IMSService.asmx/GetChannelTemplateListByUserId',
    WHATSAPP_TEMPLATE: '/IMSMOB/GetChannelTemplateListByUserId',
    REPLACED_JSON_STR_WHATSAPP_SEND: '/UserCRM/ReplacedJsonStr',
    SEND_WHATSAPP_TEMPLATE: '/IMS/Internal/Whatsapp/Template',
    ADD_PHYSICAL_APPOINTMENT: '/EmployeeTracker/PhysicalAppointmentInsert',
    //unsed
    GET_PHYSICAL_APPOINTMENT_LIST_FORSEARCH: '/UserCRMCampaign/Service/ToDoService.asmx/GetPhysicalAppointmentList_ForSearch'



  },


  PIPELINE: {
    PIPELINE_STAGEWISE_DATA: '/UserCRM/stagewise',
    GET_DEALDETAISL_FOR_EDIT: '/UserCRM/FuncForEditDealBinding',

    // FOR_OWNER: '/UserCRMCampaign/Service/ToDoService.asmx/GetUserFromHashed_List',
    SEND_SMS: '/UserCRMCampaign/Service/CRMService.asmx/SendSms',

    GET_CUSTOME_SEARCH: '/UserCRM/GetLeadCustomSearch',

    PIPELINE_HISTORY_BIND: '/UserCRM/BindPipelineList',
    GET_SCORECARD_DETAILS_NEW: '/UserCRM/GetLeadDetailByLeadId',
    GET_MOBILE_NO_FOR_SMS_VOICE: '/UserCRM/FuncToGetMobileNos',
    GET_MAILID_BY_LEADID: '/UserCRM/GetEmailIDsByLeadId',
    GET_DLT_TEMPLATE_BY_SENDER: '/UserCRM/GetDLTTemplatesBySender',
    FOR_EDIT_DEALBINDING: '/UserCRM/FuncForEditDealBinding',
    FOR_DEAL_UPDATION: '/UserCRM/FuncForDealUpdation',
    GET_TEMPLATE_CONTENT_BYID: '/UserCRM/GetTemplateContentById',
    GET_PIPELINE_STAGE: 'UserCRM/GetDealPipelineStage',
    GET_PIPELINE_LIST: '/UserCRM/GetDealPipeline',
    GET_PIPELINE_LOST_REASONS: '/UserCRM/FuncToGet_pipelineStagesLostReason',
    UPDATE_DEFAULT_PIPELINE: '/UserCRM/FuncToUpdateDefaultPipeline',
    DELETE_PIPELINE: '/UserCRM/FuncToDeleteDefaultPipeline',
    ADD_PIPELINE: '/UserCRM/FuncToAddPipeline',
    UPDATE_PIPELINE: '/UserCRM/FuncToUpdatePipeline',
  },


  INVOICE: {
    GET_SETTINGS: '/Invoice/GetSettingBySection',
    SAVE_SETTINGS: '/Invoice/InsertUpdateSettings',
    GET_PAYMENT_REQUEST: '/UserCRM/GetPaymentRequestWebForm',
    GET_INVOICE_LIST_BYID: '/Invoice/GetInvoiceListById',
    GET_INVOICE_LISTBY_LEADID: '/Invoice/GetInvoiceListByIdLeadId',
    //SAVE_APPROVAL_SETTING: '/UserCRMCampaign/Service/InvoiceService.asmx/SaveApprovalSetting',
    SAVE_APPROVAL_SETTING:'/Invoice/SaveApprovalSetting',
    //GET_OWNER_DROPDOWN: '/UserCRMCampaign/Service/ToDoService.asmx/GetUserFromHashed_List',
    GET_OWNER_DROPDOWN:'/Common/GetUserListByUserId',
    //GET_TAX_LIST_BYMODE_ENTITYID: '/UserCRMCampaign/Service/InvoiceService.asmx/GetTaxListByModeAndEntityId',
    GET_TAX_LIST_BYMODE_ENTITYID:'/GetTaxListByModeAndEntityId',
     // GET_COUNTRY: '/UserCRMCampaign/Service/InvoiceService.asmx/GetCountryList',
    GET_COUNTRY: '/Common/GetCountryList',
    // GET_STATE_BY_COUNTRY: '/UserCRMCampaign/Service/InvoiceService.asmx/GetStateListByCountryId',
    GET_STATE_BY_COUNTRY: '/Common/GetStateListByCountryId',
    // GET_CITY_BY_STATE: '/UserCRMCampaign/Service/InvoiceService.asmx/GetCityListByStateId',
    GET_CITY_BY_STATE: '/Common/GetCityListByStateId',
    //GET_PREVIEW_LIST_EDIT: '/UserCRMCampaign/Service/InvoiceService.asmx/GetProductColumnList',
    GET_PREVIEW_LIST_EDIT:'/GET_PREVIEW_LIST_EDIT',
    // ADD_TAX_SUGGESTION: '/UserCRMCampaign/Service/InvoiceService.asmx/GetTaxesForSuggetion',
    ADD_TAX_SUGGESTION: '/Invoice/GetTaxesForSuggetion',
    // ADD_ITEM_SUGGESTION: '/UserCRMCampaign/Service/InvoiceService.asmx/GetProductForSuggetion',
    ADD_ITEM_SUGGESTION: '/Invoice/GetProductForSuggetion',
    // GET_DIFF_CUSTOMER_SUGGESTION: '/UserCRMCampaign/Service/InvoiceService.asmx/GetLeadCustomerSuggection',
    GET_DIFF_CUSTOMER_SUGGESTION: '/Invoice/GetLeadCustomerSuggection',
    // GET_CURRENCY_LIST: '/UserCRMCampaign/Service/InvoiceService.asmx/GetCurrencyList',
    GET_CURRENCY_LIST: '/Invoice/GetCurrencyList',
    INSERT_NEW_INVOICE: '/Invoice/InsertNewInvoice',
    // CANCEL_INVOICE: '/UserCRMCampaign/Service/InvoiceService.asmx/UpdateInvoiceStatusByInvoiceIds',
    CANCEL_INVOICE: '/Invoice/UpdateInvoiceStatusByInvoiceIds',

    // IS_INVOICE_ALREADY_GENERATED: '/UserCRMCampaign/Service/InvoiceService.asmx/IsInvoiceNumberAlreadyExists',
    IS_INVOICE_ALREADY_GENERATED: '/Invoice/IsInvoiceNumberAlreadyExists',
    //GET_COMPANY_SETTING_DATA: '/UserCRMCampaign/Service/InvoiceService.asmx/GetCompanySettingData',
    GET_COMPANY_SETTING_DATA: '/Invoice/GetCompanySettingData',

    PRINT_INVOICE: '/UserCRM/PrintQuotation',
    MARK_AS_SENT_INVOICE: '/Invoice/UpdateInvoiceStatusByInvoiceIds',
    PRINT_INVOICE: '/UserCRM/PrintQuotation',
    MARK_AS_SENT_INVOICE: '/Invoice/UpdateInvoiceStatusByInvoiceIds',
    //DOWNLOAD_INVOICE_TEMPLATE: '/UserCRMCampaign/Service/InvoiceService.asmx/DownloadInvoiceHtmltoPdfForTemplates',
    DOWNLOAD_INVOICE_TEMPLATE: '/Invoice/DownloadInvoiceInPDF',
    // SAVE_APPROVAL_ACTION: '/UserCRMCampaign/Service/InvoiceService.asmx/SaveAprrovedData',
    SAVE_APPROVAL_ACTION: '/Invoice/SaveApprovalData',
    // GET_INVOICE_DETAILS: '/UserCRMCampaign/Service/InvoiceService.asmx/GetInvoiceDetailById',
    GET_INVOICE_DETAILS: '/Invoice/GetInvoiceDetailById',
    // GET_ENTITY_APPROVAL_SETTING: '/UserCRMCampaign/Service/InvoiceService.asmx/GetApprovalEntitySettingByEntity',
    GET_ENTITY_APPROVAL_SETTING: '/Invoice/SaveApprovalSetting',
    GET_CUSTOMER_LEDGER_SUMMARY_LIST: '/Invoice/GetCustomeredgerSummaryList',
    //GET_CURRENCY_LIST_BY_USER_ID: '/UserCRMCampaign/Service/InvoiceService.asmx/getCurrencyListByUserID',
    GET_CURRENCY_LIST_BY_USER_ID: '/Invoice/getCurrencyListByUserID',
    // GET_TAXES: '/UserCRMCampaign/Service/InvoiceService.asmx/GetTaxes',
    GET_TAXES: '/Invoice/GetTaxes',
    // UPDATE_TAX_ENABLE_STATUS: '/UserCRMCampaign/Service/InvoiceService.asmx/UpdateTaxEnableStatus',
    UPDATE_TAX_ENABLE_STATUS: '/Invoice/UpdateTaxEnableStatus',
    // DELETE_TAX_RATE_BY_TAX_ID: '/UserCRMCampaign/Service/InvoiceService.asmx/DeleteTaxRateByTaxId',
    DELETE_TAX_RATE_BY_TAX_ID: '/Invoice/DeleteTaxRateByTaxId',
    // GET_TAX_RATE_DETAIL_BY_TAX_ID: '/UserCRMCampaign/Service/InvoiceService.asmx/GetTaxRateDetailByTaxId',
    GET_TAX_RATE_DETAIL_BY_TAX_ID: '/Invoice/GetTaxRateDetailByTaxId',
    // UPDATE_INSERT_TAXES: '/UserCRMCampaign/Service/InvoiceService.asmx/UpdateInsertTaxes',
    UPDATE_INSERT_TAXES: '/Invoice/UpdateInsertTaxes',
    // GET_PRODUCT_COLUMN_LIST: '/UserCRMCampaign/Service/InvoiceService.asmx/GetProductColumnList',
    GET_PRODUCT_COLUMN_LIST: '/Invoice/GetCompanySettingData',
    // GET_PRODUCT_COLUMN_SUGGESTION: '/UserCRMCampaign/Service/InvoiceService.asmx/GetProductColumnSuggestion',
    GET_PRODUCT_COLUMN_SUGGESTION: '/Invoice/GetProductColumnSuggestion',
  },

  Quotation: {
    // GET_QUOTATION_LIST_BYID: '/UserCRMCampaign/Service/InvoiceService.asmx/GetQuotationListById',
    GET_QUOTATION_LIST_BYID: '/Invoice/GetQuotationListById',
    GET_QUOTATION_DETAILS_BYID: '/Invoice/GetQuotationDetailById',
    INSERT_NEW_QUOTATION: '/Invoice/InsertNewQuote',
    GENERATE_INVOICE_FOR_SHOW: '/Invoice/ConvertQuotationToInvoiceByQuotationIds',
    DELETE_QUOTATION: '/Invoice/UpdateQuotationStatusByQuoteId',
    // IS_QUOTATION_ALREADY_GENERATED: '/UserCRMCampaign/Service/InvoiceService.asmx/IsQuotationNumberAlreadyExists',
    IS_QUOTATION_ALREADY_GENERATED: '/Invoice/IsInvoiceNumberAlreadyExists',
    // GET_APPROVERS_INFO: '/UserCRMCampaign/Service/InvoiceService.asmx/GetApprovalEntitySettingByEntity',
    GET_APPROVERS_INFO: '/Invoice/SaveApprovalSetting',
    // GET_APPROVED_DATA: '/UserCRMCampaign/Service/InvoiceService.asmx/GetInvoiceApprovedData',
    GET_APPROVED_DATA: '/Invoice/SaveApprovalData',
    // GET_QUOTATION_LINK: '/UserCRMCampaign/Service/InvoiceService.asmx/PrintQuotation',
    GET_QUOTATION_LINK: '/UserCRM/PrintQuotation',
    //IS_REGISTER_FOR_WHATSAPP: '/UserCRMCampaign/Service/InvoiceService.asmx/IsLeadRegisterForWhatsapp',
    IS_REGISTER_FOR_WHATSAPP: '/UserCRM/IsLeadRegisterForWhatsapp',
    // GET_TEMPLATE_SUBJECT: '/UserCRMCampaign/Service/TriggerCampaign.asmx/FuncToGetTemplateSubject',
    //GET_TEMPLATE_SUBJECT: '/UserCRM/GetMailTemplateSubject',
    GET_DOWNLOAD_TEMPLATE: '/Editor/ManageTemplate',
    //GET_QUOTATIONREPLCE_DASH_JSON: '/UserCRMCampaign/Service/InvoiceService.asmx/GetQuoatationreplacedhashJson',
    GET_QUOTATIONREPLCE_DASH_JSON: '/Invoice/GetReplacedHashJson',
    // GET_AMOUNT_IN_WORDS: '/UserCRMCampaign/Service/InvoiceService.asmx/GetQuoatationAmountInwords',
    GET_AMOUNT_IN_WORDS: '/Invoice/GetAmountInWords',
    // DOWNLOAD_QUOTATION_PDF: '/UserCRMCampaign/Service/InvoiceService.asmx/DownloadQuotationHtmltoPdfForTemplates',
    DOWNLOAD_QUOTATION_PDF: '/,',
    // CHOOSE_PLACEHOLDER_FOR_PREVIEW: '//UserCRMCampaign/Service/InvoiceService.asmx/GetProductColumnList',
    CHOOSE_PLACEHOLDER_FOR_PREVIEW: '/Invoice/GetCompanySettingData',
    // GET_QUOTATION_DETAILS_NEW: '/UserCRMCampaign/Service/InvoiceService.asmx/GetQuotationDetailById',
    GET_QUOTATION_DETAILS_NEW: '/Invoice/GetQuotationDetailById',
    // INSERT_QUOTATION_NEW: '/UserCRMCampaign/Service/InvoiceService.asmx/InsertNewQuote',
    INSERT_QUOTATION_NEW: '/Invoice/InsertNewQuote',
    // DELETE_QUOTATION_NEW: '/UserCRMCampaign/Service/InvoiceService.asmx/UpdateQuotationStatusByQuoteId',
    DELETE_QUOTATION_NEW: '/Invoice/UpdateQuotationStatusByQuoteId',
  },

  SEGMENTATION: {
    GET_SEGMENTATION_LIST: '/UserCRM/ViewSearchCriteriaList',
    //GET_SEGMENTATION_LIST_OLD: '/UserCRMCampaign/Service/CRMService.asmx/ViewSearchCriteriaList',
    //TOGGLE_CHANGE: '/UserCRMCampaign/Service/CRMService.asmx/ToggleSearchCriteriaStatus',
    TOGGLE_CHANGE: '/UserCRM/ToggleSearchCriteriaStatus',
    GET_LEAD_COUNT: '/UserCRM/GetLeadCount',
    //GET_LEAD_COUNT_OLD: '/UserCRMCampaign/Service/CRMService.asmx/GetSearchExecutionCountNew',
    // CUSTOME_SEARCH: '/UserCRMCampaign/Service/CRMService.asmx/ViewSearchCriteriaAndConditionsByID',
    CUSTOME_SEARCH: '/UserCRM/GetLeadCustomSearch',
    // GET_FIELD_NAME_LIST: '/UserCRMCampaign/Service/CRMService.asmx/GetColumnList',
    GET_FIELD_NAME_LIST: '/UserCRM/GetAllFieldList',
    // SAVE_UPDATE_SEARCHCRITERIA: '/UserCRMCampaign/Service/CRMService.asmx/SaveUpdateSearchCriteria',
    SAVE_UPDATE_SEARCHCRITERIA: '/UserCRM/SaveUpdateSearchCriteria',
  },

  PRODUCT_SEARCH_CRITERIA: {
    GET_PRODUCT_COLUMN_LIST: '/UserCRM/GetProductColumnList',
    SAVE_PRODUCT_SEARCH_CRITERIA: '/UserCRM/SaveProductSearchCriteria',
    GET_PRODUCT_LIST_BY_USER_ID: '/UserCRM/GetProductListByUserId',
  },

  REVENUE: {
    GET_REVENUE_LIST: '/UserCRMCampaign/Service/InvoiceService.asmx/GetRevenueListById',
    GET_REVENUE_LEAD_CUSTOMER_SUGGESTION: '/Invoice/GetLeadCustomerSuggection',
    GET_INVOICE_SUGGESTION: '/UserCRMCampaign/Service/InvoiceService.asmx/GetInvoiceSuggestions',
    GET_REVENUE_DETAILS: '/UserCRMCampaign/Service/InvoiceService.asmx/GetRevenueDetaileById',
    UPDATE_REVENUE_STATUS: '//UserCRMCampaign/Service/InvoiceService.asmx/UpdateRevenueStatusByIds',
    GET_HOLDING_TAX: '/UserCRMCampaign/Service/InvoiceService.asmx/GetWithHoldingTax',
    SAVE_REVENUE: '/Invoice/UpdateInsertRevenue',
    PRINT_REVENUE: '/Invoice/PrintRevenue',
    DOWNLOAD_REVENUE_PDF: '/Invoice/DownloadRevenueInPDF',
    DOWNLOAD_REVENUE_PDF_CONVERTER: '/Invoice/DownloadRevenueInPDFConverter',
  },

  LEAD_ACTIVITIES: {
    GET_LEAD_ACTIVITY: 'UserCRMCampaign/Service/LeadService.asmx/funcToGetLeadActivityDetails_WithFilter',
    GET_LEAD_DETAILS_ACTIVITY_DATA: '/UserCRMCampaign/Service/ActivityMetaData.asmx/GetActivityMetaData',
    EXPORT_LEAD_ACTIVITY: '/UserCRM/ExportLeadActivityDetails',
  },

  COMMON: {
    // GET_SMS_ACCOUNT: '/UserCRMCampaign/Service/IMSService.asmx/getSmsAccount',
    GET_SMS_ACCOUNT: '/UserCRM/GetEnquirySmsSenderAccount',
    // GET_LEAD_BY_ID: '/UserCRMCampaign/Service/IMSService.asmx/GetLeadById',
    GET_LEAD_BY_ID: '/UserCRM/GetLeadDetailListNew',
    // GET_FROM_MAIL_ID_LEGACY: '/UserCRMCampaign/Service/CRMService.asmx/funcToGetFromMailID',
    GET_FROM_MAIL_ID_LEGACY: '/UserCRM/GetFromMailId',
    // SEND_EMAIL_SUBMIT: '/UserCRMCampaign/Service/CRMService.asmx/SendEmail',
    SEND_EMAIL_SUBMIT: '/UserCRM/SendEmailFromUser',

    NEW_GET_FROM_MAIL_ID: '/Common/GetFromMailIdByUserId',
    NEW_GET_TEMPLATE_FOR_MAIL: '/UserCRM/GetEnquiryMailTemplate',
    NEW_SEND_MAIL: '/UserCRM/LeadSendEmail',
    NEW_SEND_SMS: '/UserCRM/LeadSendSMS',
    NEW_SEND_VOICE: '/Common/GetDniOrAppId',
    ADD_VOICE: '/UserCRM/SendVoice',
    ADD_NOTES: '/UserCRM/InsertUpdateLeadNotes',
    PIPELINE_STAGE_BASED_ON_DEALPIPELINE: '/UserCRM/GetDealPipelineStage',
    SAVE_DEAL: '/UserCRM/SaveDealData',
    GET_WEBFORM_LIST_BYUSERID: '/UserCRM/GetUserWebformListByUserId',

    // GET_TASK_HISTORY: '/UserCRMCampaign/Service/LeadAssignmentService.asmx/GetTaskHistoryListByUserId',
    GET_TASK_HISTORY: '/UserCRM/GetTaskHistoryListByUserIdNew',
    // FUNC_TO_GET_PLACEHOLDER: '/UserCRMCampaign/Service/TriggerCampaign.asmx/FuncToGetEntityPlaceHolder',
    FUNC_TO_GET_PLACEHOLDER: '/UserCRM/FuncToGetEntityPlaceHolder',
    // EXPORT_WIDGET_DOWNLOAD: '/UserCRMCampaign/Service/CallReportService.asmx/ExportWidgetDownload',
    EXPORT_WIDGET_DOWNLOAD: '/UserCRM/ExportDataByEntity',

    // <- fix this to the services prefix that your setupProxy maps:
    COMMON_ACTION_MODE_BASED: '/Common/CommonActionModebased',

    // Make this relative so buildUrl('SERVICES', ...) works:
    EXPORT_DATA_SETTING: '/EmployeeTracker/ExportDataSetting',
    // Fetch_Lead_BasicInfo: '/UserCRMCampaign/Service/IMSService.asmx/GetLeadById'

    GET_MAIL_SMS_DLT_ACCOUNT: '/UserCRM/GetMailSmsDLTAccount',
    GET_FROM_MAIL_ID: '/UserCRM/GetFromMailId',
    GET_Follow_Up_DETAILS_FOR_LEADVIEW: '/UserCRM/GetLeadActivityListByLeadId',
    GET_NOTES_DETAILS_FOR_LEADVIEW: '/UserCRM/GetLeadNotesDetailByLeadId',
    GET_DOCUMENT_DETAILS_FOR_LEADVIEW: '/UserCRM/GetLeadDocumentDetailByLeadId',
    GET_PIPELINE_HISTORY_BY_LEADID: '/UserCRM/PipelineHistoryByLeadID',
    ADD_FOLLOW_UP_DLT: '/UserCRM/AddLeadFollowup_DLT',
    SEND_VOICE_NEW: "/UserCRM/SendVoiceEnquiryOrLead",
    CALL_WIDGET: '/api/ClickToCall/GetEndpointSetting',
    // REPORT_CALL_ENDED_TIME: '/UserCRMCampaign/Service/LeadAssignmentService.asmx/ReportCallEndedTime',
    REPORT_CALL_ENDED_TIME: '/ClicktoCall/ReportCallEndedTime',
    // UPDATE_CALL_FAILED_STATUS: '/UserCRMCampaign/Service/LeadAssignmentService.asmx/UpdateFailedCallStatus',
    UPDATE_CALL_FAILED_STATUS: '/UserCRM/UpdateFailedCallStatus',
    SEND_MAIL_NEW: '/UserCRM/SendEmailFromUser',
    // GET_LEAD_CUSTOME_SEARCH: '/UserCRMCampaign/Service/LeadAssignmentService.asmx/getLeadCustomSearch',
    GET_LEAD_CUSTOME_SEARCH: '/UserCRM/GetLeadCustomSearch',
    UPLOAD_DOCUMENT: '/UserCRM/UploadLeadDocument',
    GET_MAIL_SUBJECT_FROM_TEMPLATE: '/UserCRM/GetMailTemplateSubject',
    GET_PIPELINE_FROM_LEADID: "/UserCRM/FuncToGetPiplelineFromLeadID",
    GEP_MAPPING_STATUS: '/UserCRM/FuncToGetStageMappedStatus',
    GET_COMMENTS: '/UserCRM/GetTaskCommentsById',
    GET_TASK_APPOINTMENT_HISTORY: '/UserCRM/GetTaskHistoryListByUserId_new',
    DELETE_NOTES: '/UserCRM/DeleteNotes',
    DELETE_DOCUMENT: '/UserCRM/DeleteDocument',
    // GET_PHYSICAL_APPOINTMENTLIST: '/UserCRMCampaign/Service/ToDoService.asmx/GetPhysicalAppointmentWidgetList',
    GET_PHYSICAL_APPOINTMENTLIST: '/UserCRM/GetPhysicalAppointmentFormDetail',
    GET_WA_CHAT_LOG: '/IMSMOB/GetConversationAsRequiredConvId',
    GET_LEAD_DETAILS_WITH_CUSTOM: '/UserCRM/GetLeadDetailListNew',
    GET_CUSTOM_FIELDS_NEW: '/Common/GetCustomFieldByParentId',
    CALL_WIDGET: '/api/ClickToCall/GetEndpointSetting',
    // GET_TASK_PHYSICAL_APPOINTMENT_TYPE:'/UserCRMCampaign/Service/ToDoService.asmx/GetTaskTypeByMode',
    GET_TASK_PHYSICAL_APPOINTMENT_TYPE: '/UserCRM/GetTaskTypeByMode',
    GET_TOKEN: '/Admin/GetDeviceToken',
    GET_ALL_PERMISSION_BY_MODULE_CODE: '/userauth/GetAllPermissionByModuleCodeUserIdCSV',
    GET_ALL_HIERARCHICAL_DISPLAY_BY_USER_ID: '/UserAuth/GetAllHeirarchicalDisplayByUserID',
    // GET_FIELD_MASKED:'/UserCRMCampaign/Service/FieldMasked.asmx/getfieldmasked',
    GET_FIELD_MASKED: '/Common/GetFieldMasked',
    // GET_ALL_NOTIFICATION:'/UserCRMCampaign/Service/Notification.asmx/funcToDisplayNotification',
    GET_ALL_NOTIFICATION: '/UserCRM/DisplayNotification',
    // GET_NOTIFICATION_COUNT:'/UserCRMCampaign/Service/Notification.asmx/funcToDisplayNotification',
    GET_NOTIFICATION_COUNT: '/UserCRM/DisplayNotification',
    // MARK_AS_READ_NOTIFICATION:'/UserCRMCampaign/Service/Notification.asmx/FuncToMarkAsRead',
    MARK_AS_READ_NOTIFICATION: '/UserCRM/UpdateNotificationStatus',
    // DELETE_NOTIFICATION:'/UserCRMCampaign/Service/Notification.asmx/FuncToMarkAsDeleted',
    DELETE_NOTIFICATION: '/UserCRM/UpdateNotificationStatus',
    // NOTIFICATION_DETAILS:'/UserCRMCampaign/Service/InvoiceService.asmx/GetNotificationDetail',
    NOTIFICATION_DETAILS: '/UserCRM/GetNotification',
    API_BIND_MENU_NEW: '/api/Common/BindUserMenu',
    HELP_DATA_BIND: '/Common/CommonActionModebased',
    TASK_TYPE: '/UserCRM/GetCustomUserTaskListByUserId',
    ADD_TICKET: '/TicketSupport/SaveManageTicketDetails',
    ADD_TECKET_NEW: '/TicketSupport/SaveRaiseTicketDetails',
    // CUSTOM_BUTTON_CRUD: '/UserCRMCampaign/Service/CustomButtonServices.asmx/*',
    CUSTOM_BUTTON_GET_LIST: '/Common/GetCustomButtonList',
    CUSTOM_BUTTON_SAVE: '/Common/SaveCustomButton',
    CUSTOM_BUTTON_DELETE: '/Common/DeleteCustomButton',
    CUSTOM_BUTTON_GET_BY_ID: '/Common/GetCustomButtonById',
    CUSTOM_BUTTON_GET_PLACEHOLDER: '/Common/GetCustomButtonPlaceholder',
    // LEAD_SERVICE_EXPORT: '/UserCRMCampaign/Service/LeadService.asmx/ExportLeadList',
    LEAD_SERVICE_EXPORT: '/UserCRM/ExportLeadData',
    // LEAD_SERVICE_GET_MASS_OPERATION_LEAD_ID: '/UserCRMCampaign/Service/LeadService.asmx/GetMassOperationLeadID',
    LEAD_SERVICE_GET_MASS_OPERATION_LEAD_ID: '/UserCRM/GetMassOperationLeadID',
    // MANAGE_DEFAULT_SEARCH_NAME: '/UserCRMCampaign/Service/CRMService.asmx/ManageDefaultSearchName',
    MANAGE_DEFAULT_SEARCH_NAME: '/UserCRM/ManageDefaultSearchName',
    // GET_DLT_TEMPLATE_TEXT: '/UserCRMCampaign/Service/CRMService.asmx/Get_DLTTemplateText',
    GET_DLT_TEMPLATE_TEXT: '/UserCRM/GetDLTTemplateText',
    // DOWNLOAD_INVOICE_PDF: '/UserCRMCampaign/Service/InvoiceService.asmx/DownloadInvoiceHtmltoPdf',
    DOWNLOAD_INVOICE_PDF: '/Invoice/DownloadInvoiceInPDF',
    // DOWNLOAD_QUOTATION_PDF_DIRECT: '/UserCRMCampaign/Service/InvoiceService.asmx/DownloadQuotationHtmltoPdf',
    DOWNLOAD_QUOTATION_PDF_DIRECT: '/Invoice/DownloadQuotationInPDF',
    // UPLOAD_LEAD_DOCUMENT_WCF: '/UserCRMCampaign/Service/CRMService.asmx/UploadLeadDocument',
    UPLOAD_LEAD_DOCUMENT_WCF: '/UserCRM/UploadLeadDocuments',
    // GET_DEAL_PIPELINE_WCF: '/UserCRMCampaign/Service/IMSService.asmx/getDealPipeline',
    GET_DEAL_PIPELINE_WCF: '/UserCRM/GetDealPipeline',
    // GET_DEAL_PIPELINE_STAGE_WCF: '/UserCRMCampaign/Service/IMSService.asmx/getDealPipelineStage',
    GET_DEAL_PIPELINE_STAGE_WCF: '/UserCRM/GetDealPipelineStage',

    // NEW APIs created in WCF-to-API migration pass (2026-06-15)
    GET_CUSTOM_FIELD_BY_USER_ID: '/DialerSetting/GetCustomFieldByUserId',
    GET_EMAIL_TEMPLATE_LIST_BY_USER_ID: '/UserCRM/GetEmailTemplateListByUserId',
    VALIDATE_DLT_TEMPLATE_TEXT: '/UserCRM/ValidateDLTTemplateText',
    GET_DEAL_PIPELINE_STAGE_REASON: '/UserCRM/GetDealPipelineStageReason',
    CHECK_TAG_IS_EXISTS: '/UserCRM/CheckTagIsExists',
    SAVE_TAGS_FROM_TAG_MASTER: '/UserCRM/SaveTagsFromTagMaster',
    UPDATE_TAG_STATUS_BY_ID: '/UserCRM/UpdateTagStatusById',
    GET_ALL_TAGS_BY_USER_ID: '/UserCRM/GetAllTagsByUserId',
    GET_USER_LEAD_FIELDS: '/UserCRM/GetUserLeadFields',
    UPLOAD_LEAD_DOCUMENT_FILE: '/UserCRM/UploadLeadDocumentFile',
    UPLOAD_ATTACHMENT: '/Common/UploadAttachment',

    // Migrated from WCF Service paths (kept as comments for tracking)
    // GET_CALL_LOG_MASTER: '/UserCRMCampaign/Service/CallReportService.asmx/GetCallLogMaster',
    // GET_CUSTOM_FIELDS_BY_USER_ID: '/UserCRMCampaign/Service/CRMService.asmx/GetCustomFieldByUserId',
    // GET_EMAIL_TEMPLATE_LIST: '/UserCRMCampaign/Service/IMSService.asmx/getEmailTemplateList',
    // GET_DID_NOS: '/UserCRMCampaign/Service/IMSService.asmx/GetDIDNo',
    // VALIDATE_DLT_TEXT: '/UserCRMCampaign/Service/CRMService.asmx/ValidateDLTTemplateText',
    // GET_PIPELINE_STAGE_REASON: '/UserCRMCampaign/Service/IMSService.asmx/getDealPipelineStageReason',
    // CHECK_TAG_EXISTS: '/UserCRMCampaign/Service/LeadAssignmentService.asmx/CheckTagIsExists',
    // SAVE_TAGS: '/UserCRMCampaign/Service/LeadAssignmentService.asmx/SaveTagsFromTagMaster',
    // UPDATE_TAG_STATUS: '/UserCRMCampaign/Service/LeadAssignmentService.asmx/UpdateTagStatusById',
    // GET_ALL_TAGS: '/UserCRMCampaign/Service/LeadAssignmentService.asmx/GetAllTagsByUserId',
    // GET_USER_LEAD_FIELDS: '/UserCRMCampaign/Service/EmailService.asmx/GetUserLeadFeilds',
    // UPLOAD_LEAD_FILE: '/UserCRMCampaign/Handler/LeadHandler.ashx',
    // UPLOAD_ATTACHMENT_FILE: '/UserCRMCampaign/Handler/AttachmentHandler.ashx',

  },



  DASHBOARD: {
    GET_SCORECARD_DETAILS_TASK: '/Dashboard/FuncToGetTaskSectionDetails',
    GET_SCORECARD_DETAILS_APPOINTMENT: '/Dashboard/FuncToGetAppointmentSectionDetails',
    GET_SCORECARD_DETAILS_FollowUp: '/Dashboard/FuncToGetFollowupDueSectionDetails',
    GET_SCORECARD_DETAILS_Pipeline: '/Dashboard/FuncToGetPipelineSectionDetails',
    GET_CUSTOME_DASHBOARD_LIST: '/Dashboard/GetSavedCustomDashboards',
    GET_SECTION_DATA: '/Dashboard/GetSectionDropdownData',
    LOAD_REPORTS: '/Dashboard/LoadReports',
    LOAD_REPORTS_BY_SECTIONS: '/Dashboard/LoadReportsBySection',
    GET_SAVE_TILES: '/Dashboard/GetSavedTiles',
    SAVE_TILES: '/Dashboard/SaveTiles',

    FuncToGetEnquirySectionDetails_Counter: '/Dashboard/FuncToGetEnquirySectionDetails',
    FuncToGetLeadSectionDetails_Counter: '/Dashboard/FuncToGetLeadSectionDetails',
    FuncToGetFollowupDueSectionDetails_Counter: '/Dashboard/FuncToGetFollowupDueSectionDetails',
    GetEnquirySourceAnalysis_Charts: '/Dashboard/GetEnquirySourceAnalysis',
    GetEnquiryMediumAnalysis_Charts: '/Dashboard/GetEnquiryMediumAnalysis',
    GetEnquiryCampaignAnalysis_Charts: '/Dashboard/GetEnquiryCampaignAnalysis',
    GetLeadReportsForLeadAndFollowup_List: '/Dashboard/GetLeadReportsForLeadAndFollowup',
    DELETE_DASHBOARD: '/Dashboard/DeleteCustomDashboardTiles',
    EDIT_DASHBOARD: '/Dashboard/editCustomDashboard',
    TOTOL_DashBoard: '/Dashboard/TotalCustomDashboard',
    SAVE_CUSTOME_DASHBOARD: '/Dashboard/SaveDashboard',
    GET_DASHBOAD_TILES: '/Dashboard/GetDashboardSavedTiles',
    GET_LIST_REPORT_DASHBOARD: '/Dashboard/FuncToGetListDetails',
    GET_SOURCE_DETAILS: '/Dashboard/FuncToGetSourceDetails',
    GET_REPORT_FOR_TASK_AND_APPOINTMENT: '/Dashboard/GetLeadReportsForLeadAndFollowup',
    GET_ENQUIRY_DETAILS: '/Dashboard/FuncToGetEnquirySectionDetails',
    GET_LEAD_DETAILS: '/Dashboard/FuncToGetLeadSectionDetails',
    DASHBOARD_ORDER: '/Dashboard/SaveCustomDashboardOrder',
    // QA_DASHBOARD_TILES:'/UserCRMCampaign/Service/EnquiryReport.asmx/GetEnquiryReportsCollectively',
    QA_DASHBOARD_TILES: '/UserCRM/GetEnquiryReportCollectively',
    // PIPEPINE_REPORTS:'/UserCRMCampaign/Service/LeadReport.asmx/GetLeadReportsForPipeline',
    PIPEPINE_REPORTS: '/Dashboard/FuncToGetPipelineSectionDetails',

    LOAD_USERS: '/Dashboard/LoadUsers',
    SAVE_DASHBOARD_MAIL_SETTING: '/Dashboard/SaveDashboardMailSetting',
    VIEW_DASHBOARD_SETTING_BY_PARENTID: '/Dashboard/ViewDashboardMailSettingByParent',
    DASHBOARD_MAIL_SETTING_STATUS: '/Dashboard/ChangeMailSettingStatus',
    VEIW_DASHBOARD_SETTINGBYID: '/Dashboard/ViewDashboardMailSettingByID',
    GET_SCRAPBOOK: '/ScrapBook/SearchScrapBook',
    GET_CALENDER_VIEW: '/UserCRM/GetCalendarViewNew',
    SAVE_SCRAP_NOTES: '/ScrapBook/SaveNotes',
    GET_CONVERSION_DETAILS: '/Dashboard/FuncToGetConversionSectionDetails',
  },
  PRODUCT: {
    GET_UNIT_LIST: '/UserCRMCampaign/Service/ProductService.asmx/funcToDisplayUnitList',
    GET_CATEGORY_LIST: '/UserCRMCampaign/Service/ProductService.asmx/funcToDisplayCategoryList',
    GET_TAX_LIST: '/UserCRMCampaign/Service/ProductService.asmx/funcToDisplayTaxList',
    GET_ACCOUNT_LIST: '/UserCRMCampaign/Service/ProductService.asmx/funcToDisplayAccountList',
    GET_TAG_LIST: '/UserCRMCampaign/Service/ProductService.asmx/funcToDisplayTagListWithFilter',
    GET_CUSTOM_FIELDS: '/UserCRMCampaign/Service/ProductService.asmx/GetPrdCustomfields',
    SAVE_PRODUCT: '/UserCRMCampaign/Service/ProductService.asmx/funcToSaveProductDetails',
    GET_PRODUCT_IMPORT_STATUS: '/UserCRM/GetProductImportStatus',
    GET_PRODUCT_IMPORT_REMARKS: '/UserCRM/GetProductImportRemarks',

    MEDIA_LIBRARY_TOKEN_VALIDATION: '/medialibrary/ValidateUserToken',
    GET_QUOTA: '/medialibrary/GetQuota',
    GET_STORAGE_LIBRARY_LIST: '/medialibrary/GetStorageLibraryList',
  },

  CUSTOM_EVENTS: {
    GET_LIST: '/AddOn/GetActivityMasters',
    SAVE: '/AddOn/SaveAcitivityMaster',
    GET_DETAILS: '/AddOn/GetActivityDetailById',
    REMOVE: '/AddOn/RemoveCustomEvent',
    UPDATE_STATUS: '/AddOn/UpdateActivityStatus',
    GET_ENTITY_PLACEHOLDER: '/UserCRMCampaign/Service/TriggerCampaign.asmx/FuncToGetEntityPlaceHolder'
  },


  EMPLOYEE_TRACKER: {
    // Geofencing & Territories
    SAVE_TERRITORY: '/EmployeeTracker/SaveTerritory',
    GET_TERRITORY_BY_ID: '/EmployeeTracker/GetTerritory_ByTerritoryId',
    GET_GEOFENCE: '/EmployeeTracker/GetGeofence',
    SAVE_GEOFENCE: '/EmployeeTracker/SaveGeofence',
    SAVE_LOCATION: '/EmployeeTracker/SaveLocation',
    GET_LOCATION: '/EmployeeTracker/GetLocation',
    GET_LOCATION_BY_ID: '/EmployeeTracker/GetLocationByLocationId',
    SAVE_LOCATION_POOL: '/EmployeeTracker/SaveLocationPool',
    GET_GEOFENCE_LIST: '/EmployeeTracker/GetGeofence_Name',
    DELETE_GEOFENCE: '/EmployeeTracker/GetGeofence_ByGeofenceId',
    // Compliance & Rules
    FIELD_CONDITION_LIST: '/EmployeeTracker/FieldConditionList',
    GET_COMPLIANCE_RULE_LIST: '/EmployeeTracker/GetComplianceRuleList_Name',
    COMPLIANCE_RULE_SAVE: '/EmployeeTracker/ComplianceRuleSave',
    GET_COMPLIANCE_RULE_BY_ID: '/EmployeeTracker/GetComplianceRuleById',
    DELETE_COMPLIANCE_RULE: '/EmployeeTracker/DeleteComplianceRuleById',
    CHECK_IN_OUT_AUTH_ISSUE: '/EmployeeTracker/CheckInOutAuthIssue',
    CHECK_IN_OUT_AUTH_APPROVE: '/EmployeeTracker/CheckInOutAuthApprove',
    GET_CHECK_IN_OUT_AUTH_STATUS: '/EmployeeTracker/GetCheckInOutAuthStatus',


    // Attendance / Shift Settings
    GET_ATTENDANCE_GROUP_LIST: '/EmployeeTracker/GetAttendanceGroupList',
    ATTENDANCE_GROUP_SAVE: '/EmployeeTracker/AttendanceGroupSave',
    DELETE_ATTENDANCE_GROUP: '/EmployeeTracker/DeleteAttendanceGroupById',
    SHIFT_MASTER_LIST: '/EmployeeTracker/ShiftMasterList',
    SHIFT_MASTER_SAVE: '/EmployeeTracker/ShiftMasterSave',
    SHIFT_USER_MAPPING_LIST: '/EmployeeTracker/ShiftUserMappingList_Name',
    BREAK_TYPE_MASTER_LIST: '/EmployeeTracker/BreakTypeMasterList',
    BREAK_TYPE_MASTER_SAVE: '/EmployeeTracker/BreakTypeMasterSave',
    DELETE_BREAK_MASTER: '/EmployeeTracker/DeleteBreakMasterByBreakTypeId'
  },
  MASTER_SETTING_PAGES: {
    GET_DIALER_LIST: '/DialerSetting/GetDialserSettingList',
    DIALER_OPERATIONS: '/DialerSetting/RollSettingAction',
    GET_DIALER_ROLES: '/DialerSetting/GetRoleMasterListByUserId',
    GET_ENTITY_SETTING: '/UserCRMCampaign/Service/InvoiceService.asmx/GetApprovalEntitySettingListByUserId',
    GET_ENTITY_SETTING_BY_ID: '//UserCRMCampaign/Service/InvoiceService.asmx/GetInvoiceApprovalEntitySettingById',
    USER_SUGGESTIONS: '/Flow/UserSuggestions',
    FOR_SAVE_ENTITY: '/UserCRMCampaign/Service/InvoiceService.asmx/SaveAprroveEntitySetting',

    // User Hierarchy Endpoints
    GET_USER_HIERARCHY: '/UserAuth/GetUserHierarchyByParentId',
    SAVE_USER_HIERARCHY: '/UserAuth/SaveUserHierarchyMapping',
    GET_USER_LIST: '/UserAuth/GetUserFromHashedListByParentId',
    GET_ROLE_LIST: '/UserAuth/GetRoleByParentId',

    //Lead Assignment 
    SAVE_RULE: '/UserCRM/SaveRule',
    GET_LEAD_ASSIGNMENT: '/UserCRM/GetLeadAssignmentMaster',
    LEAD_ASSIGNMENT_GLOBAL_SETTING: '/UserCRM/LeadAssignmentGlobalSetting',
    LEAD_ASSIGNMENT_ACTIVE_INACTIVE: '/UserCRM/LeadAssignmentRuleActiveInactive',
    GET_ALL_FIELDS: '/UserCRM/GetAllFieldList',
    GET_COLLABORATOR_TYPES: '/UserCRM/funcToGetCollTypeList',
    GET_COLLABORATOR_TEAMS: '/UserCRM/GetTeamsByTypeIds',

  },

  // ===================== CAMPAIGN SETTINGS =====================
  CAMPAIGN: {
    GET_LIST: '/UserCRM/GetCampaignSettingsList',
    INSERT: '/UserCRM/InsertCampaignSetting',
    UPDATE: '/UserCRM/UpdateCampaignSetting',
    DELETE: '/UserCRM/DeleteCampaignSetting',
  },

  // ===================== MEDIUM SETTINGS =====================
  MEDIUM: {
    GET_LIST: '/UserCRM/GetMediumSettingsList',
    INSERT: '/UserCRM/InsertMediumSetting',
    UPDATE: '/UserCRM/UpdateMediumSetting',
    DELETE: '/UserCRM/DeleteMediumSetting',
  },

  // ===================== MAIL SETTINGS =====================
  MAIL_SETTINGS: {
    GET_LIST: '/UserCRM/GetMailSettingsList',
    INSERT: '/UserCRM/InsertMailSetting',
    DELETE: '/UserCRM/DeleteMailSetting',
  },

  // ===================== FIELD MASKING =====================
  FIELD_MASKING: {
    // Web
    GET_WEB_LIST: '/UserAuth/GetPageFieldsMaskUserList',
    GET_WEB_PAGES: '/UserAuth/GetTableListPageFileds',
    GET_WEB_FIELDS: '/UserAuth/GetTablePageFiledsList',
    GET_WEB_FIELDS_EDIT: '/UserAuth/GetTablePageFiledsListEdit',
    GET_WEB_ROW_BY_ID: '/UserAuth/GetTablePageFiledsByPageHiddenFieldsId',
    SAVE_WEB: '/UserAuth/SavePageFiledsByUserId',
    UPDATE_WEB: '/UserAuth/UpdatePageFiledsByUserId',
    DELETE_WEB: '/UserAuth/DeletePageFiledsByPageHiddenFieldsId',
    // Mobile
    GET_MOB_LIST: '/UserAuth/GetPageMobFieldsMaskUserList',
    GET_MOB_PAGES: '/UserAuth/GetMobileTableListPageFields',
    GET_MOB_FIELDS: '/UserAuth/GetMobileTablePageFieldList',
    GET_MOB_ROW_BY_ID: '/UserAuth/GetTablePageFiledsByPageHiddenFieldsId_Mob',
    SAVE_MOB: '/UserAuth/SaveMobilePageFieldsByUserId',
    UPDATE_MOB: '/UserAuth/UpdatePageFiledsByUserId_Mob',
    DELETE_MOB: '/UserAuth/DeletePageFiledsByPageHiddenFieldsId_Mob',
    // Roles
    GET_ROLE_LIST: '/UserAuth/GetRoleList',
  },


  // ===================== REPORTS =====================
  REPORTS: {
    // Followup Report
    GET_FOLLOWUP_REPORTS: '/UserCRM/GetFollowupReports',
    GET_FOLLOWUP_REPORT_EXPORT: '/UserCRM/GetFollowupReportExport',

    // Enquiry Report
    GET_ENQUIRY_REPORT: '/Report/GetEnquiryReport',
    GET_ENQUIRY_REPORT_EXPORT: '/Report/GetEnquiryReportExport',

    // Mass Operation Report
    GET_MASS_OPERATION_STATUS: '/Dashboard/GetMassOperationStatus',
    GET_MASS_OPERATION_BATCH_ID: '/UserCRM/GetMassOperationBatchId',
  },

};

export default API_ENDPOINTS;
export { BASES };



