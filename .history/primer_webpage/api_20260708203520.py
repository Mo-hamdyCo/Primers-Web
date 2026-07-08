import frappe

@frappe.whitelist(allow_guest=True)
def create_lead(first_name, email, phone, company_name=None, industry=None, message=None):
    try:
       
        if frappe.db.exists("Lead", {"email_id": email}):
            return {"status": "success", "message": "You have already registered. We will contact you soon."}

        lead = frappe.get_doc({
            "doctype": "Lead",
            "first_name": first_name,
            "email_id": email,
            "mobile_no": phone,
            "company_name": company_name,
            "job_title": industry,
            "status": "Lead"
        })
        lead.insert(ignore_permissions=True)
        frappe.db.commit()
        return {"status": "success", "message": "Thank you! Your information has been submitted successfully."}
    except Exception as e:
        frappe.log_error(title="Landing Page Lead Creation Error", message=frappe.get_traceback())
        return {"status": "error", "message": "Something went wrong. Please try again later."}
