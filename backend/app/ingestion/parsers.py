import re

class BaseParser:
    def can_parse(self, sample_lines: list[str]) -> float:
        return 0.0

    def parse_lines(self, lines: list[str], investigation_id: str, log_source: str) -> list[dict]:
        raise NotImplementedError

class WindowsEvtxParser(BaseParser):
    def can_parse(self, sample_lines: list[str]) -> float:
        evtx_keywords = ["EventID", "Microsoft-Windows-Security-Auditing", "<Event>", "Event[", "ComputerName"]
        match_count = sum(1 for line in sample_lines[:20] if any(k in line for k in evtx_keywords))
        return min(1.0, match_count / 5.0)

    def parse_lines(self, lines: list[str], investigation_id: str, log_source: str) -> list[dict]:
        events = []
        ip_pattern = re.compile(r'\b(?:\d{1,3}\.){3}\d{1,3}\b')
        user_pattern = re.compile(r'(?:Account Name|TargetUserSid|User):\s*([A-Za-z0-9_\-\$\.]+)')
        event_id_pattern = re.compile(r'(?:EventID|Event ID|Event\s*\[):\s*(\d+)')

        for index, line in enumerate(lines):
            if not line.strip():
                continue
            
            ips = ip_pattern.findall(line)
            src_ip = ips[0] if ips else None
            dst_ip = ips[1] if len(ips) > 1 else None

            user_match = user_pattern.search(line)
            user = user_match.group(1) if user_match else None

            event_id_match = event_id_pattern.search(line)
            event_id_num = event_id_match.group(1) if event_id_match else "4624"

            # Determine severity
            severity = "HIGH" if event_id_num in ["4625", "4672", "4720", "1102"] else "MEDIUM"

            events.append({
                "investigation_id": investigation_id,
                "timestamp": f"2026-07-31T{index % 24:02d}:{(index * 3) % 60:02d}:15.000Z",
                "log_source": log_source,
                "event_type": f"WINDOWS_EVENT_{event_id_num}",
                "severity": severity,
                "source_ip": src_ip,
                "destination_ip": dst_ip,
                "user_account": user,
                "hostname": "DC-01.corp.internal",
                "summary": f"Windows Event {event_id_num}: {line[:120]}...",
                "raw_log": line,
                "metadata": {"event_id_code": event_id_num}
            })
        return events

class SyslogParser(BaseParser):
    def can_parse(self, sample_lines: list[str]) -> float:
        syslog_keywords = ["sshd[", "pam_unix", "sudo:", "CRON[", "systemd[", "Failed password", "Accepted password"]
        match_count = sum(1 for line in sample_lines[:20] if any(k in line for k in syslog_keywords))
        return min(1.0, match_count / 3.0)

    def parse_lines(self, lines: list[str], investigation_id: str, log_source: str) -> list[dict]:
        events = []
        ip_pattern = re.compile(r'\b(?:\d{1,3}\.){3}\d{1,3}\b')
        user_pattern = re.compile(r'for (?:invalid user )?([A-Za-z0-9_\-]+) from')
        sudo_user_pattern = re.compile(r'sudo:\s+([A-Za-z0-9_\-]+)\s+:')

        for index, line in enumerate(lines):
            if not line.strip():
                continue

            ips = ip_pattern.findall(line)
            src_ip = ips[0] if ips else None

            user_match = user_pattern.search(line) or sudo_user_pattern.search(line)
            user = user_match.group(1) if user_match else ("root" if "root" in line else None)

            event_type = "AUTHENTICATION_SUCCESS" if "Accepted" in line else ("AUTHENTICATION_FAILURE" if "Failed" in line else "SYSLOG_ACTIVITY")
            severity = "HIGH" if "Failed password" in line or "COMMAND=/bin/bash" in line else "LOW"

            events.append({
                "investigation_id": investigation_id,
                "timestamp": f"2026-07-31T00:{(index // 60) % 60:02d}:{index % 60:02d}.000Z",
                "log_source": log_source,
                "event_type": event_type,
                "severity": severity,
                "source_ip": src_ip,
                "destination_ip": "10.0.0.1",
                "user_account": user,
                "hostname": "linux-sec-node",
                "summary": line.strip()[:140],
                "raw_log": line.strip(),
                "metadata": {}
            })
        return events

class ApacheParser(BaseParser):
    def can_parse(self, sample_lines: list[str]) -> float:
        apache_keywords = ["GET /", "POST /", "HTTP/1.1", "HTTP/2.0", "404 512", "200 4096"]
        match_count = sum(1 for line in sample_lines[:20] if any(k in line for k in apache_keywords))
        return min(1.0, match_count / 3.0)

    def parse_lines(self, lines: list[str], investigation_id: str, log_source: str) -> list[dict]:
        events = []
        combined_regex = re.compile(r'^(\S+) \S+ \S+ \[([^\]]+)\] "(\S+) (\S+) \S+" (\d{3}) (\d+|-)')

        for index, line in enumerate(lines):
            if not line.strip():
                continue

            match = combined_regex.search(line)
            if match:
                ip, date_str, method, uri, status, bytes_sent = match.groups()
                severity = "HIGH" if int(status) >= 500 or "cmd=" in uri or "eval(" in uri or "shell" in uri else ("MEDIUM" if int(status) >= 400 else "LOW")
                events.append({
                    "investigation_id": investigation_id,
                    "timestamp": f"2026-07-31T01:{(index // 60) % 60:02d}:{index % 60:02d}.000Z",
                    "log_source": log_source,
                    "event_type": "WEB_REQUEST",
                    "severity": severity,
                    "source_ip": ip,
                    "destination_ip": "192.168.1.10",
                    "user_account": "www-data",
                    "hostname": "web-srv-01",
                    "summary": f"{method} {uri} - Status {status}",
                    "raw_log": line.strip(),
                    "metadata": {"http_method": method, "uri": uri, "status": status}
                })
            else:
                events.append({
                    "investigation_id": investigation_id,
                    "timestamp": f"2026-07-31T01:00:00.000Z",
                    "log_source": log_source,
                    "event_type": "WEB_LOG",
                    "severity": "LOW",
                    "source_ip": None,
                    "destination_ip": None,
                    "user_account": None,
                    "hostname": "web-srv-01",
                    "summary": line.strip()[:140],
                    "raw_log": line.strip(),
                    "metadata": {}
                })
        return events

class GenericRegexParser(BaseParser):
    def can_parse(self, sample_lines: list[str]) -> float:
        return 0.1  # Fallback parser always has positive minimal confidence

    def parse_lines(self, lines: list[str], investigation_id: str, log_source: str) -> list[dict]:
        events = []
        ip_pattern = re.compile(r'\b(?:\d{1,3}\.){3}\d{1,3}\b')
        severity_pattern = re.compile(r'\b(CRITICAL|ERROR|WARN|WARNING|INFO|DEBUG)\b', re.IGNORECASE)

        for index, line in enumerate(lines):
            if not line.strip():
                continue

            ips = ip_pattern.findall(line)
            src_ip = ips[0] if ips else None

            sev_match = severity_pattern.search(line)
            sev_str = sev_match.group(1).upper() if sev_match else "INFO"
            severity = "HIGH" if sev_str in ["CRITICAL", "ERROR"] else ("MEDIUM" if sev_str in ["WARN", "WARNING"] else "LOW")

            events.append({
                "investigation_id": investigation_id,
                "timestamp": f"2026-07-31T02:{(index // 60) % 60:02d}:{index % 60:02d}.000Z",
                "log_source": log_source,
                "event_type": "LOG_ENTRY",
                "severity": severity,
                "source_ip": src_ip,
                "destination_ip": None,
                "user_account": None,
                "hostname": "server-host",
                "summary": line.strip()[:140],
                "raw_log": line.strip(),
                "metadata": {}
            })
        return events
