from typing import Any, Dict


def create_response(data: Any = None, message: str = "Success", status_code: int = 200) -> Dict:
    """
    Helper function to create standardized API responses
    """
    response = {
        "status": "success" if 200 <= status_code < 300 else "error",
        "message": message,
    }
    
    if data is not None:
        response["data"] = data
    
    return response


def paginate_response(
    items: list,
    total: int,
    page: int = 1,
    page_size: int = 10
) -> Dict:
    """
    Helper function to create paginated responses
    """
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": (total + page_size - 1) // page_size,
    }

