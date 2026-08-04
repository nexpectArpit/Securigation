from typing import List, Dict
from app.models.schemas import InvestigationInfo, UploadedFileInfo, UnifiedSecurityEvent, SeverityEnum
from app.ingestion.normalizer import detect_and_normalize
from app.retrieval.search_engine import search_engine

# In-memory store for investigations
INVESTIGATIONS_STORE: Dict[str, InvestigationInfo] = {}

SAMPLE_DATASETS = [
    {
        "id": "demo-apt29-compromise",
        "title": "APT29 - Domain Controller SSH Brute Force & Privilege Escalation",
        "description": "Suspicious login volume from origin IP 192.168.1.105 targeting root and admin accounts.",
        "filename": "apt29_auth_security.log",
        "format": "SYSLOG",
        "events_count": 15000,
        "sample_lines": [
            "2026-07-31T00:04:12Z linux-sec-node sshd[4102]: Failed password for invalid user root from 192.168.1.105 port 49152 ssh2",
            "2026-07-31T00:04:13Z linux-sec-node sshd[4103]: Failed password for invalid user root from 192.168.1.105 port 49153 ssh2",
            "2026-07-31T00:04:15Z linux-sec-node sshd[4104]: Failed password for user admin from 192.168.1.105 port 49154 ssh2",
            "2026-07-31T00:06:45Z linux-sec-node sshd[4189]: Accepted password for admin from 192.168.1.105 port 49200 ssh2",
            "2026-07-31T00:07:10Z linux-sec-node sudo: admin : TTY=pts/0 ; PWD=/home/admin ; USER=root ; COMMAND=/bin/bash",
            "2026-07-31T00:08:30Z linux-sec-node systemd[1]: Created session 42 of user root.",
            "2026-07-31T00:09:12Z linux-sec-node scp[4210]: Uploading shadow.bak to 185.17.42.109:443"
        ]
    },
    {
        "id": "demo-apache-webshell",
        "title": "WebShell Exploitation & Command Execution on Apache",
        "description": "Automated web scanner activity followed by POST upload of shell.php and reverse connection.",
        "filename": "apache_access_error.log",
        "format": "APACHE",
        "events_count": 10000,
        "sample_lines": [
            '198.51.100.44 - - [31/Jul/2026:01:10:02 +0000] "GET /admin/login.php HTTP/1.1" 404 512',
            '198.51.100.44 - - [31/Jul/2026:01:10:45 +0000] "POST /upload.php HTTP/1.1" 200 4096',
            '198.51.100.44 - - [31/Jul/2026:01:11:15 +0000] "GET /uploads/shell.php?cmd=whoami HTTP/1.1" 200 128',
            '198.51.100.44 - - [31/Jul/2026:01:11:30 +0000] "GET /uploads/shell.php?cmd=cat+/etc/passwd HTTP/1.1" 200 2048',
            '198.51.100.44 - - [31/Jul/2026:01:12:00 +0000] "POST /uploads/shell.php HTTP/1.1" 500 1024'
        ]
    },
    {
        "id": "demo-windows-lateral",
        "title": "Windows EVTX - Mimikatz LSASS Dump & Lateral Movement",
        "description": "Event ID 4672 (Special Privileges Assigned) followed by Event ID 4624 remote login.",
        "filename": "windows_security_events.evtx",
        "format": "WINDOWS_EVTX",
        "events_count": 20000,
        "sample_lines": [
            "EventID: 4625 | ComputerName: DC-01.corp.internal | TargetUserSid: S-1-5-21 | Account Name: Administrator | Workstation: WORKSTATION-09",
            "EventID: 4672 | ComputerName: DC-01.corp.internal | Account Name: Administrator | Privileges: SeDebugPrivilege",
            "EventID: 4624 | ComputerName: DC-01.corp.internal | LogonType: 10 (RemoteDesktop) | Account Name: Administrator | Source Network Address: 10.0.4.15",
            "EventID: 1102 | ComputerName: DC-01.corp.internal | Audit Log Cleared by Account: Administrator"
        ]
    }
]

def initialize_sample_datasets():
    """Pre-populates sample datasets into the in-memory investigation store and search index."""
    for ds in SAMPLE_DATASETS:
        inv_id = ds["id"]
        
        # Build expanded event log array to simulate large log files
        lines = []
        for i in range(ds["events_count"]):
            base_line = ds["sample_lines"][i % len(ds["sample_lines"])]
            lines.append(f"{base_line} [seq_id={i}]")

        format_name, events = detect_and_normalize(lines, inv_id, ds["filename"])
        
        # Override metadata count for accurate display
        file_info = UploadedFileInfo(
            filename=ds["filename"],
            size_bytes=len("\n".join(lines).encode("utf-8")),
            detected_format=format_name,
            event_count=len(events)
        )
        
        inv_info = InvestigationInfo(
            id=inv_id,
            title=ds["title"],
            description=ds["description"],
            status="READY",
            files=[file_info],
            total_events=len(events),
            is_demo=True
        )
        
        INVESTIGATIONS_STORE[inv_id] = inv_info
        search_engine.add_events(inv_id, events)

initialize_sample_datasets()
